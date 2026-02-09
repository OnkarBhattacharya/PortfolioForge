
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileText, Github, Linkedin, UploadCloud, CheckCircle, Link2, KeyRound, Loader2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from "@/firebase";
import Link from "next/link";
import { logger } from "@/lib/logger";
import { collection, doc, query } from "firebase/firestore";

export default function ImportDataPage() {
  const { user } = useUser();
  const isReadOnly = !user || user.isAnonymous;
  const firestore = useFirestore();
  const maxFreeItems = 3;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cvUploadSuccess, setCvUploadSuccess] = useState(false);
  
  const [linkedInSuccess, setLinkedInSuccess] = useState(false);
  const [linkedInData, setLinkedInData] = useState('');
  const [isParsingLinkedIn, setIsParsingLinkedIn] = useState(false);

  const [githubUsername, setGithubUsername] = useState('');
  const [isImportingGithub, setIsImportingGithub] = useState(false);
  const [githubSuccess, setGithubSuccess] = useState(false);

  const [importUrl, setImportUrl] = useState('');
  const [isImportingUrl, setIsImportingUrl] = useState(false);
  const [importUrlSuccess, setImportUrlSuccess] = useState(false);


  const { toast } = useToast();
  
  const itemsQuery = useMemoFirebase(() => {
    if (isReadOnly || !user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'portfolioItems'));
  }, [firestore, user, isReadOnly]);

  const { data: items } = useCollection<{ id: string }>(itemsQuery);

  const userProfileRef = useMemoFirebase(() => {
    if (isReadOnly || !user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user, isReadOnly]);

  const { data: userProfile } = useDoc<{ subscriptionTier?: 'free' | 'pro' | 'studio' }>(userProfileRef);

  const isPro = userProfile?.subscriptionTier === 'pro' || userProfile?.subscriptionTier === 'studio';
  const itemCount = items?.length || 0;
  const isFreeLimitReached = !isPro && !isReadOnly && itemCount >= maxFreeItems;

  useEffect(() => {
    if (localStorage.getItem("cvUploadSuccess") === "true") {
      setCvUploadSuccess(true);
    }
    if (localStorage.getItem("linkedInSuccess") === "true") {
      setLinkedInSuccess(true);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setCvUploadSuccess(false);
    }
  };

  const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (isReadOnly || !user) {
       toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in or sign up to upload your CV.",
      });
      return;
    }
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to upload.",
      });
      return;
    }

    setIsUploading(true);

    try {
      const cvFile = await fileToDataURI(selectedFile);
      
      const response = await fetch('/api/cv-parser', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cvFile, userId: user.uid }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'CV parsing failed');
      }

      const result = await response.json();
      
      localStorage.setItem('cvData', JSON.stringify(result.data));
      localStorage.setItem("cvUploadSuccess", "true");
      setCvUploadSuccess(true);
      
      // Dispatch a storage event to notify other components (like the dashboard)
      window.dispatchEvent(new Event('storage'));
      
      toast({
        title: "AI-Powered CV Scan Successful",
        description: "Your CV has been parsed and the data is now available in your portfolio and the AI Assistant.",
      });

    } catch (error: any) {
      logger.error("CV Upload Failed", { error });
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const handleParseLinkedIn = async () => {
     if (isReadOnly || !user) {
       toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in or sign up to parse your data.",
      });
      return;
    }
    setIsParsingLinkedIn(true);
    try {
       const response = await fetch('/api/linkedin-parser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileText: linkedInData, userId: user.uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'LinkedIn parsing failed');
      }
      
      const result = await response.json();
      localStorage.setItem('cvData', JSON.stringify(result.data)); 
      localStorage.setItem('linkedInSuccess', 'true');
      setLinkedInSuccess(true);
      window.dispatchEvent(new Event('storage'));
      toast({
        title: "AI-Powered LinkedIn Import Successful",
        description: "Your LinkedIn data has been parsed and saved to your profile.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Parsing Failed",
        description: error.message || "Could not parse LinkedIn data.",
      });
    } finally {
      setIsParsingLinkedIn(false);
    }
  };
  
  const handleConnectGitHub = async () => {
    if (isReadOnly || !user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in or sign up to import from GitHub.",
      });
      return;
    }
    if (isFreeLimitReached) {
      toast({
        variant: "destructive",
        title: "Upgrade Required",
        description: "Free plans are limited to 3 portfolio items. Upgrade to import more projects.",
      });
      return;
    }
    if (!githubUsername) {
      toast({
        variant: "destructive",
        title: "Username Required",
        description: "Please enter a GitHub username.",
      });
      return;
    }

    setIsImportingGithub(true);
    try {
      const response = await fetch('/api/github-importer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: githubUsername, userId: user.uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'GitHub import failed');
      }

      const result = await response.json();
      setGithubSuccess(true);
      toast({
        title: "GitHub Import Successful",
        description: `${result.importedCount} repositories have been added to your portfolio.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "GitHub Import Failed",
        description: error.message,
      });
    } finally {
      setIsImportingGithub(false);
    }
  };

  const handleAddLink = async () => {
    if (isReadOnly || !user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in or sign up to import from a URL.",
      });
      return;
    }
    if (isFreeLimitReached) {
      toast({
        variant: "destructive",
        title: "Upgrade Required",
        description: "Free plans are limited to 3 portfolio items. Upgrade to import more projects.",
      });
      return;
    }
    if (!importUrl) {
      toast({
        variant: "destructive",
        title: "URL Required",
        description: "Please enter a URL to import.",
      });
      return;
    }

    setIsImportingUrl(true);
    try {
      const response = await fetch('/api/web-importer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: importUrl, userId: user.uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'URL import failed');
      }

      const result = await response.json();
      toast({
        title: "AI-Powered Import Successful",
        description: `"${result.name}" has been added to your portfolio.`,
      });
      setImportUrlSuccess(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message,
      });
    } finally {
      setIsImportingUrl(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          Import Data
        </h1>
        <p className="text-sm text-muted-foreground">
          Bring everything into one place. The more you import, the stronger your portfolio becomes.
        </p>
      </div>
      
      {isReadOnly && (
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50">
            <CardHeader className="flex flex-row items-center gap-4">
                <KeyRound className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                <div>
                    <CardTitle className="font-headline text-yellow-800 dark:text-yellow-300">Read-Only Mode</CardTitle>
                    <CardDescription className="text-yellow-700 dark:text-yellow-400">
                        Please <Link href="/login" className="font-bold underline">log in</Link> or <Link href="/signup" className="font-bold underline">sign up</Link> to import and save your professional data.
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
      )}
      
      {isFreeLimitReached && (
        <Card className="border-primary/40 bg-primary/5">
            <CardHeader className="flex flex-row items-center gap-4">
                <KeyRound className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle className="font-headline">Free plan limit reached</CardTitle>
                    <CardDescription>
                        Upgrade to import more portfolio items from GitHub or URLs.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/billing">Upgrade to Pro</Link>
              </Button>
            </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="font-headline text-xl">Your import checklist</CardTitle>
              <CardDescription>
                Aim for at least two sources to generate stronger AI summaries.
              </CardDescription>
            </div>
            <Button asChild variant="outline" className="w-full md:w-auto">
              <Link href="/ai-assistant">
                <Sparkles className="mr-2 h-4 w-4" /> Open AI Assistant
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm font-semibold">CV or Resume</p>
              <p className="text-xs text-muted-foreground">Best for summary and experience</p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                {cvUploadSuccess ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Loader2 className="h-4 w-4 text-muted-foreground" />}
                <span>{cvUploadSuccess ? 'Imported' : 'Pending'}</span>
              </div>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm font-semibold">LinkedIn</p>
              <p className="text-xs text-muted-foreground">Great for credibility and keywords</p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                {linkedInSuccess ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Loader2 className="h-4 w-4 text-muted-foreground" />}
                <span>{linkedInSuccess ? 'Imported' : 'Pending'}</span>
              </div>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm font-semibold">GitHub</p>
              <p className="text-xs text-muted-foreground">Turns repos into projects</p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                {githubSuccess ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Loader2 className="h-4 w-4 text-muted-foreground" />}
                <span>{githubSuccess ? 'Imported' : 'Pending'}</span>
              </div>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm font-semibold">Public URL</p>
              <p className="text-xs text-muted-foreground">Capture articles or case studies</p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                {importUrlSuccess ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Loader2 className="h-4 w-4 text-muted-foreground" />}
                <span>{importUrlSuccess ? 'Imported' : 'Pending'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 grid gap-6 md:grid-cols-2">
          <Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="font-headline flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Upload CV
              </CardTitle>
              <CardDescription>
                Upload your CV (PDF or image).
              </CardDescription>
            </div>
             {cvUploadSuccess && <CheckCircle className="h-6 w-6 text-green-500" />}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:space-x-2">
              <Input type="file" placeholder="Select file" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" disabled={isReadOnly} className="flex-1" />
            <Button onClick={handleUpload} disabled={isUploading || !selectedFile || isReadOnly} className="w-full sm:w-auto">
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                {isUploading ? 'Parsing...' : 'Upload'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
             Our multi-modal AI analyzes your CV's layout and content to pre-fill your portfolio and assist with content generation.
            </p>
          </CardContent>
        </Card>

          <Dialog>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="font-headline flex items-center gap-2">
                  <Linkedin className="h-6 w-6 text-blue-600" />
                  Import from LinkedIn
                </CardTitle>
                <CardDescription>
                  AI-powered profile import.
                </CardDescription>
              </div>
              {linkedInSuccess && <CheckCircle className="h-6 w-6 text-green-500" />}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isReadOnly}>
                  <Linkedin className="mr-2 h-4 w-4" /> {linkedInSuccess ? 'Update' : 'Import'} LinkedIn Data
                </Button>
              </DialogTrigger>
              <p className="text-xs text-muted-foreground">
                Paste your profile data to have our AI structure and import it.
              </p>
            </CardContent>
            </Card>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>AI-Powered LinkedIn Import</DialogTitle>
              <DialogDescription>
                Go to your LinkedIn profile, select "More" and then "Save to PDF". Open the PDF, copy all the text, and paste it below. Our AI will do the rest.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="linkedin-data">LinkedIn Profile Data</Label>
                <Textarea
                  id="linkedin-data"
                  value={linkedInData}
                  onChange={(e) => setLinkedInData(e.target.value)}
                  placeholder="Paste your raw LinkedIn data here..."
                  className="min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" onClick={handleParseLinkedIn} disabled={isParsingLinkedIn}>
                  {isParsingLinkedIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isParsingLinkedIn ? 'Parsing...' : 'Parse with AI'}
                </Button>
              </DialogClose>
            </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="font-headline flex items-center gap-2">
                  <Github className="h-6 w-6 text-foreground" />
                  Sync GitHub Projects
                </CardTitle>
                <CardDescription>
                  Import your top GitHub repos.
                </CardDescription>
              </div>
              {githubSuccess && <CheckCircle className="h-6 w-6 text-green-500" />}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <DialogTrigger asChild>
                <Button
                  className="w-full bg-foreground text-background hover:bg-foreground/90"
                  disabled={isReadOnly || isFreeLimitReached}
                >
                  <Github className="mr-2 h-4 w-4" /> Import from GitHub
                </Button>
              </DialogTrigger>
              <p className="text-xs text-muted-foreground">
                Automatically fetch and display your public repositories.
              </p>
            </CardContent>
            </Card>
            <DialogContent>
             <DialogHeader>
              <DialogTitle>Import from GitHub</DialogTitle>
              <DialogDescription>
                Enter your GitHub username to import your top 10 public repositories.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="github-username">GitHub Username</Label>
                <Input
                  id="github-username"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="e.g., 'torvalds'"
                />
              </div>
            </div>
            <DialogFooter>
               <DialogClose asChild>
                <Button type="button" onClick={handleConnectGitHub} disabled={isImportingGithub}>
                  {isImportingGithub ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isImportingGithub ? 'Importing...' : 'Import Projects'}
                </Button>
              </DialogClose>
            </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Link2 className="h-6 w-6 text-accent" />
                Import from URL
              </CardTitle>
              <CardDescription>
                AI-crawl a blog post or project link.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isReadOnly || isFreeLimitReached}
                >
                  <Link2 className="mr-2 h-4 w-4" /> Add via URL
                </Button>
              </DialogTrigger>
              <p className="text-xs text-muted-foreground">
                Our AI will create a portfolio item from any link.
              </p>
            </CardContent>
            </Card>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>AI-Powered URL Import</DialogTitle>
              <DialogDescription>
                Enter the URL of a blog post, article, or project you want to add to your portfolio.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="import-url">URL to Import</Label>
                <Input
                  id="import-url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://your-blog.com/your-awesome-article"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" onClick={handleAddLink} disabled={isImportingUrl}>
                  {isImportingUrl ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isImportingUrl ? 'AI is working...' : 'Import with AI'}
                </Button>
              </DialogClose>
            </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Recommended order</CardTitle>
            <CardDescription>
              Start with your CV, then LinkedIn, then projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              CV upload to capture summary + experience
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              LinkedIn for keywords and credibility
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              GitHub and URL imports for projects
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/projects">Review portfolio items</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
