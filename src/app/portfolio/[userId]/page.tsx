
'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  query,
} from 'firebase/firestore';
import { useFirebase, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Linkedin, Mail, ExternalLink, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { themes as staticThemes } from '@/lib/data';
import { notFound } from 'next/navigation';

type UserProfile = {
  id: string;
  fullName?: string;
  email?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  themeId?: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  liveDemoUrl?: string;
  githubUrl?: string;
  imageId: string;
};

type Theme = {
    id: string;
    primary: string;
    background: string;
    accent: string;
}

export default function PortfolioPage({ params: { userId } }: { params: { userId: string } }) {
  const { firestore } = useFirebase();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);
  
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);

  const themeDocRef = useMemoFirebase(() => {
    if (!firestore || !profile?.themeId) return null;
    return doc(firestore, 'themes', profile.themeId);
  }, [firestore, profile?.themeId]);

  const { data: theme, isLoading: isThemeLoading } = useDoc<Theme>(themeDocRef);

  const projectsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'users', userId, 'projects'));
  }, [firestore, userId]);

  const { data: projects, isLoading: areProjectsLoading } = useCollection<Project>(projectsQuery);
  
  const [cvData, setCvData] = useState<string | null>(null);
  const [linkedInData, setLinkedInData] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setCvData(localStorage.getItem('cvData'));
        setLinkedInData(localStorage.getItem('linkedInData'));
    }
  }, []);

  const selectedTheme = useMemo(() => {
    if (theme) return theme;
    if (profile?.themeId) {
      return staticThemes.find(t => t.id === profile.themeId) as Theme;
    }
    return staticThemes.find(t => t.id === 'default') as Theme;
  }, [theme, profile?.themeId]);


  useEffect(() => {
    if (selectedTheme) {
        document.documentElement.style.setProperty('--background', selectedTheme.background);
        document.documentElement.style.setProperty('--primary', selectedTheme.primary);
        document.documentElement.style.setProperty('--accent', selectedTheme.accent);
    }

    return () => {
        document.documentElement.style.removeProperty('--background');
        document.documentElement.style.removeProperty('--primary');
        document.documentElement.style.removeProperty('--accent');
    };
  }, [selectedTheme]);

  if (profileError) {
      notFound();
  }
  
  const isLoading = isProfileLoading || isThemeLoading || areProjectsLoading;
  
  if (isLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-background">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
      )
  }

  if (!profile) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="container mx-auto px-4 py-16 text-center">
        <Avatar className="mx-auto h-32 w-32 border-4 border-primary shadow-lg">
          <AvatarImage src={`https://picsum.photos/seed/${profile.id}/200/200`} />
          <AvatarFallback>{profile.fullName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <h1 className="mt-6 font-headline text-5xl font-bold">{profile.fullName || 'User Name'}</h1>
        <p className="mt-2 text-xl text-muted-foreground">{linkedInData?.split('\n')[0] || 'Professional Title & Company'}</p>
        <div className="mt-6 flex justify-center gap-4">
          {profile.githubUrl && <Button variant="outline" asChild><a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"><Github className="mr-2" /> GitHub</a></Button>}
          {profile.linkedinUrl && <Button variant="outline" asChild><a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"><Linkedin className="mr-2" /> LinkedIn</a></Button>}
          {profile.email && <Button variant="outline" asChild><a href={`mailto:${profile.email}`}><Mail className="mr-2" /> Email</a></Button>}
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <section id="about" className="mb-16">
          <h2 className="mb-6 font-headline text-4xl font-bold text-primary">About Me</h2>
           <Card>
            <CardContent className="pt-6">
                <p className="text-lg leading-relaxed">
                    {linkedInData || cvData || "A summary of your professional background will appear here. You can import data from your CV or LinkedIn profile on the 'Import Data' page."}
                </p>
            </CardContent>
           </Card>
        </section>

        <section id="projects">
          <h2 className="mb-6 font-headline text-4xl font-bold text-primary">Projects</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => {
              const image = getPlaceholderImage(project.imageId);
              return (
                <Card key={project.id} className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={project.name}
                      width={600}
                      height={400}
                      className="aspect-video w-full object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="font-headline">{project.name}</CardTitle>
                    <CardDescription className="h-[60px] line-clamp-3">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <div className="mb-4 flex flex-wrap gap-2">
                        {project.technologies.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                    </div>
                  </CardContent>
                   <CardContent className="flex gap-2">
                      {project.liveDemoUrl && <Button asChild className="flex-1"><a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2" /> Live Demo</a></Button>}
                      {project.githubUrl && <Button asChild variant="secondary" className="flex-1"><a href={project.githubUrl} target="_blank" rel="noopener noreferrer"><Github className="mr-2" /> Source Code</a></Button>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
      <footer className="mt-16 bg-muted py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {profile.fullName}. Built with PortfolioForge.</p>
      </footer>
    </div>
  );
}
