
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  generatePortfolioContentSuggestions,
  PortfolioContentSuggestionsOutput,
} from "@/ai/flows/ai-powered-content-suggestions";
import { useEffect, useState } from "react";
import { Loader2, Sparkles, KeyRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import Link from "next/link";
import { CvDataSchema } from "@/ai/flows/cv-parser";

const formSchema = z.object({
  profession: z.string().optional(),
  cvData: z.string().optional(),
  linkedInData: z.string().optional(),
  githubProjectsData: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AiAssistantPage() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PortfolioContentSuggestionsOutput | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const isReadOnly = !user || user.isAnonymous;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profession: "",
      cvData: "",
      linkedInData: "",
      githubProjectsData: "",
    },
  });

  useEffect(() => {
    try {
      const cvDataString = localStorage.getItem("cvData");
      if (cvDataString) {
        const cvData = CvDataSchema.parse(JSON.parse(cvDataString));
        form.setValue("cvData", JSON.stringify(cvData, null, 2));
        if (cvData.profession) {
          form.setValue("profession", cvData.profession);
        }
      }
    } catch (error) {
      console.error("Failed to parse CV data from local storage", error);
    }
    
    const linkedInData = localStorage.getItem("linkedInData");
    if (linkedInData) {
      form.setValue("linkedInData", linkedInData);
    }
  }, [form]);

  async function onSubmit(values: FormValues) {
    if (isReadOnly) {
       toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in or sign up to use the AI Assistant.",
      });
      return;
    }
    setLoading(true);
    setSuggestions(null);
    try {
      const result = await generatePortfolioContentSuggestions(values);
      setSuggestions(result);
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate content suggestions. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          AI Content Assistant
        </h1>
      </div>

       {isReadOnly && (
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50">
            <CardHeader className="flex flex-row items-center gap-4">
                <KeyRound className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                <div>
                    <CardTitle className="font-headline text-yellow-800 dark:text-yellow-300">Read-Only Mode</CardTitle>
                    <CardDescription className="text-yellow-700 dark:text-yellow-400">
                        Please <Link href="/login" className="font-bold underline">log in</Link> or <Link href="/signup" className="font-bold underline">sign up</Link> to generate AI-powered content.
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Your Professional Data</CardTitle>
            <CardDescription>
              Provide data from your CV, LinkedIn, or other sources. The more context you provide, the better the AI suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Profession</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Software Engineer, Graphic Designer, Marketing Manager"
                          className="min-h-[30px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your profession helps the AI tailor its suggestions. This is automatically detected from your CV.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="cvData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CV / Resume Data</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste text from your CV here or upload it on the Import Data page."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is automatically populated when you upload your CV on the Import Data page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedInData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile Data</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your LinkedIn summary, experience, etc."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        You can import this on the Import Data page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading || isReadOnly} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Suggestions
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Suggested Description</CardTitle>
              <CardDescription>
                A compelling headline for your portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert min-h-[100px]">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              ) : (
                suggestions?.suggestedDescription || <p className="text-muted-foreground">Suggestions will appear here...</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Suggested Summary</CardTitle>
              <CardDescription>
                A professional summary to introduce yourself.
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert min-h-[150px]">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>
              ) : (
                suggestions?.suggestedSummary || <p className="text-muted-foreground">Suggestions will appear here...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
