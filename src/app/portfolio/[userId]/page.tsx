
'use client';
import { useEffect, useMemo, use, useState } from 'react';
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
import { Github, Linkedin, Mail, ExternalLink, Loader2, Briefcase, GraduationCap, Star } from 'lucide-react';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { themes as staticThemes } from '@/lib/data';
import { z } from 'zod';

const CvDataSchema = z.object({
  personalInfo: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }).optional(),
  summary: z.string().optional(),
  experience: z.array(z.object({
    jobTitle: z.string().optional(),
    company: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    responsibilities: z.array(z.string()).optional(),
  })).optional(),
  education: z.array(z.object({
    degree: z.string().optional(),
    institution: z.string().optional(),
    location: z.string().optional(),
    graduationDate: z.string().optional(),
  })).optional(),
  skills: z.array(z.string()).optional(),
});

type CvData = z.infer<typeof CvDataSchema>;

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
  projectUrl?: string;
  imageId: string;
};

type Theme = {
    id: string;
    primary: string;
    background: string;
    foreground: string;
    accent: string;
}

const sampleProfile: UserProfile = {
    id: 'sample-user',
    fullName: 'Alex Doe',
    email: 'alex.doe@example.com',
    linkedinUrl: 'https://linkedin.com/in/example',
    githubUrl: 'https://github.com/example',
    themeId: 'default',
};

const sampleProjects: Project[] = [
    {
        id: 'sample-1',
        name: 'E-commerce Platform',
        description: 'A full-stack e-commerce solution with a modern UI, secure payment gateway, and a powerful admin dashboard for managing products and orders.',
        technologies: ['React', 'Next.js', 'Firebase', 'Stripe'],
        projectUrl: '#',
        imageId: 'project-5',
    },
    {
        id: 'sample-2',
        name: 'Data Visualization Dashboard',
        description: 'A real-time analytics dashboard that provides insightful visualizations for complex datasets, helping businesses make data-driven decisions.',
        technologies: ['D3.js', 'TypeScript', 'Node.js'],
        projectUrl: '#',
        imageId: 'project-2',
    },
    {
        id: 'sample-3',
        name: 'AI Content Summarizer',
        description: 'A web application that uses a powerful AI model to generate concise summaries of long articles, saving users time and effort.',
        technologies: ['Python', 'FastAPI', 'Genkit', 'Docker'],
        projectUrl: '#',
        imageId: 'project-3',
    }
];

export default function PortfolioPage({ params }: { params: { userId: string } }) {
  const { userId } = use(params);
  const { firestore } = useFirebase();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);
  
  const { data: dbProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);

  const cvDataDocRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'cvData', userId);
  }, [firestore, userId]);

  const { data: cvDataDocument, isLoading: isCvDataLoading } = useDoc<{ parsedData: CvData }>(cvDataDocRef);
  const cvData = cvDataDocument?.parsedData;

  const themeDocRef = useMemoFirebase(() => {
    if (!firestore || !dbProfile?.themeId) return null;
    return doc(firestore, 'themes', dbProfile.themeId);
  }, [firestore, dbProfile?.themeId]);

  const { data: theme, isLoading: isThemeLoading } = useDoc<Theme>(themeDocRef);

  const projectsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'users', userId, 'projects'));
  }, [firestore, userId]);

  const { data: dbProjects, isLoading: areProjectsLoading } = useCollection<Project>(projectsQuery);
  
  const isLoading = isProfileLoading || isThemeLoading || areProjectsLoading || isCvDataLoading;
  
  const profile = !isLoading && !dbProfile && !profileError ? sampleProfile : dbProfile;
  const projects = !isLoading && (!dbProjects || dbProjects.length === 0) && !profileError ? sampleProjects : dbProjects;
  
  const selectedTheme = useMemo(() => {
    if (theme) return theme;
    const themeId = profile?.themeId || 'default';
    const foundTheme = staticThemes.find(t => t.id === themeId) || staticThemes[0];
    return {
        id: foundTheme.id,
        primary: foundTheme.primary,
        background: foundTheme.background,
        foreground: foundTheme.foreground,
        accent: foundTheme.accent,
    };
  }, [theme, profile?.themeId]);


  useEffect(() => {
    if (selectedTheme) {
        document.documentElement.style.setProperty('--background', selectedTheme.background);
        document.documentElement.style.setProperty('--foreground', selectedTheme.foreground);
        document.documentElement.style.setProperty('--primary', selectedTheme.primary);
        document.documentElement.style.setProperty('--accent', selectedTheme.accent);
    }

    return () => {
        document.documentElement.style.removeProperty('--background');
        document.documentElement.style.removeProperty('--foreground');
        document.documentElement.style.removeProperty('--primary');
        document.documentElement.style.removeProperty('--accent');
    };
  }, [selectedTheme]);

  
  if (isLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-background">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
      )
  }

  if (profileError) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Portfolio Not Found</h1>
                <p className="text-muted-foreground">This user profile could not be loaded. It may have been deleted or the link is incorrect.</p>
              </div>
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
        <h1 className="mt-6 font-headline text-5xl font-bold">{cvData?.personalInfo?.name || profile.fullName || 'User Name'}</h1>
        <p className="mt-2 text-xl text-muted-foreground">{cvData?.summary || 'A passionate full-stack developer with a love for creating beautiful and functional web applications.'}</p>
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
                    {cvData?.summary || "Welcome to my portfolio! I'm a dedicated software engineer specializing in building modern web applications with React, Next.js, and Firebase. My experience spans from creating beautiful user interfaces to designing robust backend systems. I thrive on solving complex problems and am always eager to learn new technologies. This portfolio showcases some of my favorite projects. Feel free to explore and get in touch!"}
                </p>
            </CardContent>
           </Card>
        </section>

        {cvData?.experience && cvData.experience.length > 0 && (
          <section id="experience" className="mb-16">
            <h2 className="mb-8 font-headline text-4xl font-bold text-primary">Work Experience</h2>
            <div className="space-y-8">
              {cvData.experience.map((job, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-start gap-4">
                    <Briefcase className="h-8 w-8 text-accent" />
                    <div>
                      <CardTitle className="font-headline text-2xl">{job.jobTitle}</CardTitle>
                      <CardDescription className="text-lg">{job.company} &middot; {job.location}</CardDescription>
                      <p className="text-sm text-muted-foreground">{job.startDate} - {job.endDate}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-2 pl-6">
                      {job.responsibilities?.map((res, i) => <li key={i}>{res}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {cvData?.education && cvData.education.length > 0 && (
            <section id="education" className="mb-16">
                <h2 className="mb-8 font-headline text-4xl font-bold text-primary">Education</h2>
                <div className="space-y-8">
                    {cvData.education.map((edu, index) => (
                        <Card key={index}>
                             <CardHeader className="flex flex-row items-start gap-4">
                                <GraduationCap className="h-8 w-8 text-accent" />
                                <div>
                                    <CardTitle className="font-headline text-2xl">{edu.institution}</CardTitle>
                                    <CardDescription className="text-lg">{edu.degree}</CardDescription>
                                    <p className="text-sm text-muted-foreground">Graduated: {edu.graduationDate}</p>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </section>
        )}

        {cvData?.skills && cvData.skills.length > 0 && (
            <section id="skills" className="mb-16">
                 <h2 className="mb-6 font-headline text-4xl font-bold text-primary">Skills</h2>
                <Card>
                    <CardContent className="flex flex-wrap gap-4 pt-6">
                        {cvData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-lg px-4 py-2">{skill}</Badge>
                        ))}
                    </CardContent>
                </Card>
            </section>
        )}

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
                      {project.projectUrl && <Button asChild className="flex-1"><a href={project.projectUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2" /> Live Demo</a></Button>}
                      {project.projectUrl && <Button asChild variant="secondary" className="flex-1"><a href={project.projectUrl} target="_blank" rel="noopener noreferrer"><Github className="mr-2" /> Source Code</a></Button>}
                  </CardContent>
                </Card>
              );
            })}
             {!projects || projects.length === 0 && (
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <h3 className="text-xl font-bold">No projects yet!</h3>
                        <p className="text-muted-foreground">Add your first project from the 'Projects' page to see it here.</p>
                    </CardContent>
                </Card>
             )}
          </div>
        </section>
      </main>
      <footer className="mt-16 bg-muted py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {cvData?.personalInfo?.name || profile.fullName}. Built with PortfolioForge.</p>
      </footer>
    </div>
  );
}

    