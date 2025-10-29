
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
import { FileText, Github, Linkedin, UploadCloud, CheckCircle } from "lucide-react";
import { useState } from "react";
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker source for pdfjs
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}


export default function ImportDataPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
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
      let text = '';
      if (selectedFile.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          if (!e.target?.result) return;
          const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
          const pdf = await pdfjs.getDocument(typedArray).promise;
          let content = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            content += textContent.items.map((item: any) => item.str).join(' ');
          }
          saveCvData(content);
        };
        reader.readAsArrayBuffer(selectedFile);
        return; // Handled in onload
      } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          if (!e.target?.result) return;
          const result = await mammoth.extractRawText({ arrayBuffer: e.target.result as ArrayBuffer });
          saveCvData(result.value);
        };
        reader.readAsArrayBuffer(selectedFile);
        return; // Handled in onload
      } else if (selectedFile.type === 'text/plain') {
        text = await selectedFile.text();
        saveCvData(text);
      } else {
        throw new Error("Unsupported file type. Please upload a .txt, .pdf, or .docx file.");
      }
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

  const saveCvData = (text: string) => {
     try {
        localStorage.setItem('cvData', text);
        setUploadSuccess(true);
        toast({
          title: "Upload Successful",
          description: "Your CV has been parsed and saved.",
        });
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Save Failed",
          description: "Could not save CV data. Local storage might be full.",
        });
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
      }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          Import Data
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="font-headline flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Upload CV
              </CardTitle>
              <CardDescription>
                Upload your CV (.txt, .pdf, .docx).
              </CardDescription>
            </div>
             {uploadSuccess && <CheckCircle className="h-6 w-6 text-green-500" />}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex w-full items-center space-x-2">
              <Input type="file" placeholder="Select file" onChange={handleFileChange} accept=".txt,.pdf,.docx" />
              <Button onClick={handleUpload} disabled={isUploading || !selectedFile} size="icon">
                <UploadCloud className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              We&apos;ll parse your CV to pre-fill your portfolio sections.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="font-headline flex items-center gap-2">
                <Linkedin className="h-6 w-6 text-blue-600" />
                Import from LinkedIn
              </CardTitle>
              <CardDescription>
                Connect your LinkedIn to import data.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Linkedin className="mr-2 h-4 w-4" /> Connect LinkedIn
            </Button>
            <p className="text-xs text-muted-foreground">
              Populate your profile with your LinkedIn experience and skills.
            </p>
          </CardContent>
        </Card>

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
            <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
              <Github className="mr-2 h-4 w-4" /> Connect GitHub
            </Button>
            <p className="text-xs text-muted-foreground">
              Automatically fetch and display your public repositories.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
