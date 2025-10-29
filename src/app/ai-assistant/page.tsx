
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
import { Loader2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  cvData: z.string().optional(),
  linkedInData: z.string().optional(),
  githubProjectsData: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AiAssistantPage() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PortfolioContentSuggestionsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cvData: "",
      linkedInData: "",
      githubProjectsData: "",
    },
  });

  useEffect(() => {
    const cvData = localStorage.getItem("cvData");
    if (cvData) {
      form.setValue("cvData", cvData);
    }
  }, [form]);

  async function onSubmit(values: FormValues) {
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
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Your Professional Data</CardTitle>
            <CardDescription>
              Paste your data below. The more context you provide, the better the suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="cvData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CV / Resume Data</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste text from your CV here..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Job titles, descriptions, skills, etc. You can also upload your CV on the Import Data page.
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
                        Your summary, work experience, and endorsements.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="githubProjectsData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Project Descriptions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste descriptions of your key GitHub projects."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Briefly describe 1-3 of your most important projects.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
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
