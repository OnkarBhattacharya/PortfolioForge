import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Github, Linkedin, UploadCloud } from "lucide-react";

export default function ImportDataPage() {
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
                Upload your CV in PDF or DOCX format.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex w-full items-center space-x-2">
              <Input type="file" placeholder="Select file" />
              <Button type="submit" size="icon">
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
