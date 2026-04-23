
"use client";

export const dynamic = 'force-dynamic';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { useEffect, useState } from "react";
import { Loader2, Sparkles, KeyRound, CheckCircle2 } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import { useToast } from "../../hooks/use-toast";
import { useUser } from "../../firebase";
import Link from "next/link";
import { CvDataSchema } from "../../lib/types";
import { logger } from "../../lib/logger";

const formSchema = z.object({
  profession: z.string().optional(),
  cvData: z.string().optional(),
  linkedInData: z.string().optional(),
  githubProjectsData: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AiAssistantPage() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any | null>(null);
  const [hasCvData, setHasCvData] = useState(false);
  const [hasProfession, setHasProfession] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
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
    setIsMounted(true);

    const updateFormData = () => {
        try {
            const cvDataString = localStorage.getItem("cvData");
            if (cvDataString) {
                const cvData = CvDataSchema.parse(JSON.parse(cvDataString));
                form.setValue("cvData", JSON.stringify(cvData, null, 2));
                if (cvData.profession) {
                    form.setValue("profession", cvData.profession);
                }
                setHasCvData(true);
                setHasProfession(!!cvData.profession);
            } else {
                setHasCvData(false);
                setHasProfession(false);
            }
        } catch (error) {
            logger.error("Failed to parse CV data from local storage", { error });
        }
    };
    
    updateFormData();
    window.addEventListener('storage', updateFormData);
    window.addEventListener('profileUpdate', updateFormData);
    
    return () => {
        window.removeEventListener('storage', updateFormData);
        window.removeEventListener('profileUpdate', updateFormData);
    };
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
      const response = await fetch("/api/ai/ai-powered-content-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to generate suggestions");
      }

      const result = await response.json();
      setSuggestions(result);
    } catch (error: any) {
      logger.error("Error generating content:", { error });
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error?.message || "Could not generate content suggestions. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!isMounted || isUserLoading) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center p-4 md:p-6">
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading AI Assistant...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          AI Content Assistant
        </h1>
        <p className="text-sm text-muted-foreground">
          Turn raw data into a polished headline and summary in seconds.
        </p>
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

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
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
                <div className="grid gap-3 rounded-lg border bg-background p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">CV data detected</span>
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className={`h-4 w-4 ${hasCvData ? "text-green-500" : "text-muted-foreground"}`} />
                      {hasCvData ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Profession detected</span>
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className={`h-4 w-4 ${hasProfession ? "text-green-500" : "text-muted-foreground"}`} />
                      {hasProfession ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Profession</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Software Engineer, Graphic Designer, Marketing Manager"
                          className="min-h-[60px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your profession helps the AI tailor its suggestions. This is automatically detected from your CV or LinkedIn data.
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
                      <FormLabel>CV / LinkedIn Data</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="This data is automatically populated when you import from your CV or LinkedIn on the Import Data page."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is the structured data extracted by our AI from your uploaded documents.
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

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg">Need more data?</CardTitle>
              <CardDescription>
                Import a CV or LinkedIn profile for richer AI results.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button asChild variant="outline">
                <Link href="/import-data">Import data now</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/projects">Review portfolio items</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

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
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg">How to use these</CardTitle>
              <CardDescription>
                Copy the sections into your profile summary and portfolio hero.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Use the description as a headline on your portfolio.</p>
              <p>Use the summary as your bio and in your About section.</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/settings">Update profile settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
