
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

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to upload.",
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        try {
          localStorage.setItem('cvData', text);
          setUploadSuccess(true);
          toast({
            title: "Upload Successful",
            description: "Your CV has been uploaded and saved.",
          });
        } catch (error) {
           toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Could not save CV data. Local storage might be full.",
          });
        }
      }
      setIsUploading(false);
      setSelectedFile(null);
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error reading the file.",
      });
    };

    // For now, we only support .txt files. PDF/DOCX would require a library.
    if (selectedFile.type === "text/plain") {
       reader.readAsText(selectedFile);
    } else {
       setIsUploading(false);
       toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "For now, we only support .txt files.",
      });
    }
  };

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
                Upload your CV. We support .txt files for now.
              </CardDescription>
            </div>
             {uploadSuccess && <CheckCircle className="h-6 w-6 text-green-500" />}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex w-full items-center space-x-2">
              <Input type="file" placeholder="Select file" onChange={handleFileChange} accept=".txt" />
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
