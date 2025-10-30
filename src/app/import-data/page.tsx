
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
import { FileText, Github, Linkedin, UploadCloud, CheckCircle, Link2, KeyRound } from "lucide-react";
import { useState, useEffect } from "react";
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUser } from "@/firebase";
import Link from "next/link";
import { Canvas } from "canvas";

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

// Polyfill for OffscreenCanvas
if (typeof window !== 'undefined' && typeof OffscreenCanvas === 'undefined') {
  // @ts-ignore
  global.OffscreenCanvas = class OffscreenCanvas {
    constructor(width: number, height: number) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      return canvas;
    }
  };
}


export default function ImportDataPage() {
  const { user } = useUser();
  const isReadOnly = !user || user.isAnonymous;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cvUploadSuccess, setCvUploadSuccess] = useState(false);
  const [linkedInSuccess, setLinkedInSuccess] = useState(false);
  const [linkedInData, setLinkedInData] = useState('');
  const [isSavingLinkedIn, setIsSavingLinkedIn] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const cvData = localStorage.getItem("cvData");
    if (cvData) {
      setCvUploadSuccess(true);
    }
    const liData = localStorage.getItem("linkedInData");
    if (liData) {
      setLinkedInSuccess(true);
      setLinkedInData(liData);
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

  const pdfToImageDataURI = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    
    // Create a canvas element to render the PDF page
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) {
        throw new Error('Could not get canvas context');
    }

    await page.render({ canvasContext: context, viewport: viewport }).promise;
    return canvas.toDataURL('image/png');
  };
  

  const handleUpload = async () => {
    if (isReadOnly) {
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
      let imageDataUri = '';
      if (selectedFile.type === 'application/pdf') {
        imageDataUri = await pdfToImageDataURI(selectedFile);
      } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        toast({
          variant: "destructive",
          title: "Unsupported File Type",
          description: "DOCX parsing is coming soon! Please upload a PDF for now.",
        });
         setIsUploading(false);
        return;
      } else if (selectedFile.type.startsWith('image/')) {
        imageDataUri = await fileToDataURI(selectedFile);
      } else {
        throw new Error("Unsupported file type. Please upload a PDF or image file.");
      }

      await parseAndSaveCv(imageDataUri);

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "An unexpected error occurred.",
      });
      setIsUploading(false);
    }
  };

  const parseAndSaveCv = async (cvImage: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/cv-parser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cvImage, userId: user.uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'CV parsing failed');
      }

      localStorage.setItem('cvData', 'true'); // Indicate that CV data has been processed
      setCvUploadSuccess(true);
      toast({
        title: "AI-Powered CV Scan Successful",
        description: "Your CV has been parsed and the data is now available in your portfolio.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "CV Processing Failed",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const handleSaveLinkedIn = () => {
     if (isReadOnly) {
       toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in or sign up to save your data.",
      });
      return;
    }
    setIsSavingLinkedIn(true);
    try {
      localStorage.setItem('linkedInData', linkedInData);
      setLinkedInSuccess(true);
      toast({
        title: "LinkedIn Data Saved",
        description: "Your LinkedIn data has been saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save LinkedIn data. Local storage might be full.",
      });
    } finally {
      setIsSavingLinkedIn(false);
    }
  };
  
  const handleConnectGitHub = () => {
    toast({
      title: "Coming Soon!",
      description: "Full GitHub integration is under development.",
    });
  };

  const handleAddLink = () => {
    toast({
      title: "Coming Soon!",
      description: "Functionality to add other links is under development.",
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          Import Data
        </h1>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="font-headline flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Upload CV
              </CardTitle>
              <CardDescription>
                Upload your CV (PDF recommended).
              </CardDescription>
            </div>
             {cvUploadSuccess && <CheckCircle className="h-6 w-6 text-green-500" />}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:space-x-2">
              <Input type="file" placeholder="Select file" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" disabled={isReadOnly} className="flex-1" />
              <Button onClick={handleUpload} disabled={isUploading || !selectedFile || isReadOnly} className="w-full sm:w-auto">
                <UploadCloud className="mr-2 h-4 w-4" />
                {isUploading ? 'Parsing CV...' : 'Upload'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
             Our new multi-modal AI will analyze your CV's layout and content to pre-fill your portfolio.
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
                  Paste your LinkedIn profile data.
                </CardDescription>
              </div>
              {linkedInSuccess && <CheckCircle className="h-6 w-6 text-green-500" />}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isReadOnly}>
                  <Linkedin className="mr-2 h-4 w-4" /> {linkedInSuccess ? 'Update' : 'Add'} LinkedIn Data
                </Button>
              </DialogTrigger>
              <p className="text-xs text-muted-foreground">
                Manually paste your profile data to populate your portfolio.
              </p>
            </CardContent>
          </Card>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import LinkedIn Data</DialogTitle>
              <DialogDescription>
                Go to your LinkedIn profile, select "More" and then "Save to PDF". Open the PDF, copy the text, and paste it below. You can also paste your summary, experience, etc.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="linkedin-data">LinkedIn Profile Data</Label>
                <Textarea
                  id="linkedin-data"
                  value={linkedInData}
                  onChange={(e) => setLinkedInData(e.target.value)}
                  placeholder="Paste your LinkedIn data here..."
                  className="min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" onClick={handleSaveLinkedIn} disabled={isSavingLinkedIn}>
                  {isSavingLinkedIn ? 'Saving...' : 'Save Data'}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="font-headline flex items-center gap-2">
                <Github className="h-6 w-6 text-foreground" />
                Sync GitHub Projects
              </CardTitle>
              <CardDescription>
                Showcase your projects from GitHub.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              className="w-full bg-foreground text-background hover:bg-foreground/90"
              onClick={handleConnectGitHub}
              disabled={isReadOnly}
            >
              <Github className="mr-2 h-4 w-4" /> Connect GitHub
            </Button>
            <p className="text-xs text-muted-foreground">
              Automatically fetch and display your public repositories.
            </p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Link2 className="h-6 w-6 text-accent" />
                Other Platforms
              </CardTitle>
              <CardDescription>
                Link to your blog, Dribbble, or other profiles.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddLink}
                disabled={isReadOnly}
              >
                <Link2 className="mr-2 h-4 w-4" /> Add Links
              </Button>
              <p className="text-xs text-muted-foreground">
                Showcase your presence across the web.
              </p>
            </CardContent>
          </Card>

      </div>
    </div>
  );
}
