
'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
} from 'firebase/firestore';
import { useFirebase, useMemoFirebase } from '@/firebase';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { themes } from '@/lib/data';
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
  title: string;
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

const getPlaceholderImage = (id: string) => {
    return PlaceHolderImages.find((img) => img.id === id);
};

export default function PortfolioPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const { firestore } = useFirebase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [cvData, setCvData] = useState<string | null>(null);
  const [linkedInData, setLinkedInData] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setCvData(localStorage.getItem('cvData'));
        setLinkedInData(localStorage.getItem('linkedInData'));
    }
  }, []);

  useEffect(() => {
    if (!firestore || !userId) return;

    const fetchPortfolioData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch user profile
        const userDocRef = doc(firestore, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          throw new Error('User not found');
        }
        const userProfileData = { id: userDocSnap.id, ...userDocSnap.data() } as UserProfile;
        setProfile(userProfileData);

        // Fetch theme
        const themeId = userProfileData.themeId || 'default';
        const themeDocRef = doc(firestore, 'themes', themeId);
        const themeDocSnap = await getDoc(themeDocRef);
        
        let themeData;
        if (themeDocSnap.exists()) {
            themeData = themeDocSnap.data() as Theme;
        } else {
            // Fallback to static theme if not found in DB
            themeData = themes.find(t => t.id === themeId) as Theme;
        }
        setTheme(themeData);
        
        // Dynamically apply theme colors
        if (themeData) {
            document.documentElement.style.setProperty('--background', themeData.background);
            document.documentElement.style.setProperty('--primary', themeData.primary);
            document.documentElement.style.setProperty('--accent', themeData.accent);
        }

        // Fetch projects
        const projectsQuery = query(collection(firestore, 'users', userId, 'projects'));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(projectsData);
      } catch (err: any) {
        console.error("Failed to fetch portfolio data:", err);
        setError(err.message);
        if (err.message === 'User not found') {
            notFound();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();

    // Cleanup function to reset styles
    return () => {
        document.documentElement.style.removeProperty('--background');
        document.documentElement.style.removeProperty('--primary');
        document.documentElement.style.removeProperty('--accent');
    };

  }, [firestore, userId]);
  
  if (isLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-background">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
      )
  }
  
  if (error) {
       return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <p className="text-destructive-foreground">Failed to load portfolio: {error}</p>
        </div>
      )
  }

  if (!profile) {
    return null; // Or some other placeholder/error
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
            {projects.map((project) => {
              const image = getPlaceholderImage(project.imageId);
              return (
                <Card key={project.id} className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={project.title}
                      width={600}
                      height={400}
                      className="aspect-video w-full object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="font-headline">{project.title}</CardTitle>
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
