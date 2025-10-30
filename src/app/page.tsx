
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  ArrowUpRight,
  CheckCircle,
  Circle,
  KeyRound,
} from 'lucide-react';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { useEffect, useState } from 'react';
import { useUser, useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';


type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  imageId: string;
};

const sampleProjects: Project[] = [
    {
        id: 'sample-1',
        name: 'E-commerce Platform',
        description: 'A full-stack e-commerce solution with a modern UI, secure payment gateway, and a powerful admin dashboard for managing products and orders.',
        technologies: ['React', 'Next.js', 'Firebase', 'Stripe'],
        imageId: 'project-5',
    },
    {
        id: 'sample-2',
        name: 'Data Visualization Dashboard',
        description: 'A real-time analytics dashboard that provides insightful visualizations for complex datasets, helping businesses make data-driven decisions.',
        technologies: ['D3.js', 'TypeScript', 'Node.js'],
        imageId: 'project-2',
    },
    {
        id: 'sample-3',
        name: 'AI Content Summarizer',
        description: 'A web application that uses a powerful AI model to generate concise summaries of long articles, saving users time and effort.',
        technologies: ['Python', 'FastAPI', 'Genkit', 'Docker'],
        imageId: 'project-3',
    }
];

export default function DashboardPage() {
  const [cvUploaded, setCvUploaded] = useState(false);
  const [linkedInImported, setLinkedInImported] = useState(false);
  const { user } = useUser();
  const { firestore } = useFirebase();
  const isReadOnly = !user || user.isAnonymous;

  const projectsQuery = useMemoFirebase(() => {
    if (isReadOnly || !firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'projects'), limit(3));
  }, [user, firestore, isReadOnly]);

  const { data: dbProjects, isLoading: areProjectsLoading } = useCollection<Project>(projectsQuery);

  const recentProjects = isReadOnly ? sampleProjects : dbProjects;


  useEffect(() => {
    if (isReadOnly) return;
    const cvData = localStorage.getItem('cvData');
    if (cvData) {
      setCvUploaded(true);
    }
    const liData = localStorage.getItem('linkedInData');
    if (liData) {
      setLinkedInImported(true);
    }

    const handleStorageChange = () => {
        const cvData = localStorage.getItem('cvData');
        if (cvData) {
            setCvUploaded(true);
        }
        const liData = localStorage.getItem('linkedInData');
        if (liData) {
            setLinkedInImported(true);
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isReadOnly]);

  const liveSiteUrl = user && !user.isAnonymous ? `/portfolio/${user.uid}` : `/login`;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          Dashboard
        </h1>
      </div>

       {isReadOnly && (
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50">
            <CardHeader className="flex flex-row items-center gap-4">
                <KeyRound className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                <div>
                    <CardTitle className="font-headline text-yellow-800 dark:text-yellow-300">Read-Only Mode</CardTitle>
                    <CardDescription className="text-yellow-700 dark:text-yellow-400">
                        You are in read-only mode. <Link href="/login" className="font-bold underline">Log in</Link> or <Link href="/signup" className="font-bold underline">sign up</Link> to start building your portfolio.
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
      )}


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Welcome to PortfolioForge
            </CardTitle>
            <CardDescription>
              Let&apos;s build your standout professional portfolio. Follow the steps
              below to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              This platform helps you seamlessly import your projects and data
              to create a professional portfolio. Use our AI Assistant to
              perfect your story.
            </p>
          </CardContent>
          <CardContent>
            <Button asChild>
              <Link href="/import-data">
                Import Your Data
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">Profile Status</CardTitle>
            <CardDescription>
              Complete these steps to enrich your portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-center">
                {isReadOnly ? (
                    <Circle className="mr-3 h-5 w-5 text-muted-foreground" />
                ) : (
                    <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                )}
                <span>Account Created</span>
              </li>
              <li className="flex items-center">
                {cvUploaded && !isReadOnly ? (
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="mr-3 h-5 w-5 text-muted-foreground" />
                )}
                <span>CV Uploaded</span>
              </li>
              <li className="flex items-center">
                {linkedInImported && !isReadOnly ? (
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="mr-3 h-5 w-5 text-muted-foreground" />
                )}
                <span>LinkedIn Imported</span>
              </li>
              <li className="flex items-center text-muted-foreground/80">
                <Circle className="mr-3 h-5 w-5" />
                <span>GitHub Synced</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">Quick Links</CardTitle>
            <CardDescription>
              Jump to any section to manage your portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button variant="outline" asChild>
              <Link href="/projects">View Projects</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/ai-assistant">AI Assistant</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/settings">Settings</Link>
            </Button>
            <Button asChild className="bg-accent text-accent-foreground">
              <Link href={liveSiteUrl}>View Live Site</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Projects</CardTitle>
            <CardDescription>
              A glimpse of your latest work. Add more from the projects page.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentProjects?.map((project) => {
              const image = getPlaceholderImage(project.imageId);
              return (
                <Card key={project.id} className="overflow-hidden">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={project.name}
                      width={600}
                      height={400}
                      data-ai-hint={image.imageHint}
                      className="aspect-video w-full object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="font-headline text-lg">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies?.map((tag: any) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
             {!areProjectsLoading && (!recentProjects || recentProjects.length === 0) && (
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <h3 className="text-xl font-bold">No projects yet!</h3>
                        <p className="text-muted-foreground">Add your first project from the 'Projects' page to see it here.</p>
                    </CardContent>
                </Card>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
