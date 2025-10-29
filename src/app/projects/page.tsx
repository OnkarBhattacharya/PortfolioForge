
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useCollection, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Github, Loader2, PlusCircle, KeyRound, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { collection, query } from 'firebase/firestore';
import AddProjectDialog from './add-project-dialog';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useMemo } from 'react';


type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  imageId: string;
};

const sampleProjects: Project[] = [
    {
      "id": "gh-1",
      "name": "React Component Library",
      "description": "A collection of reusable UI components built with React and Storybook. Focused on accessibility and ease of use.",
      "technologies": ["React", "Storybook", "TypeScript"],
      "projectUrl": "https://github.com/example/react-component-library",
      "imageId": "project-1",
    },
    {
      "id": "gh-2",
      "name": "GraphQL API Server",
      "description": "A backend server providing a GraphQL API for a mobile application. Built with Node.js, Express, and Apollo Server.",
      "technologies": ["Node.js", "Express", "GraphQL", "Apollo"],
      "projectUrl": "https://github.com/example/graphql-api-server",
      "imageId": "project-2",
    }
  ];

export default function ProjectsPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const isReadOnly = !user || user.isAnonymous;

  const projectsQuery = useMemoFirebase(() => {
    if (!user || !firestore || user.isAnonymous) return null;
    return query(
      collection(firestore, 'users', user.uid, 'projects')
    );
  }, [firestore, user]);

  const { data: firestoreProjects, isLoading: areProjectsLoading } = useCollection<Project>(projectsQuery);

  const isLoading = isUserLoading || areProjectsLoading;

  const allProjects = useMemo(() => {
    if (isReadOnly) {
        return sampleProjects;
    }
    return firestoreProjects || [];
  }, [firestoreProjects, isReadOnly]);


  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          My Projects
        </h1>
        <AddProjectDialog>
          <Button disabled={isReadOnly}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </AddProjectDialog>
      </div>

       {isReadOnly && (
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50">
            <CardHeader className="flex flex-row items-center gap-4">
                <KeyRound className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                <div>
                    <CardTitle className="font-headline text-yellow-800 dark:text-yellow-300">Read-Only Mode</CardTitle>
                    <CardDescription className="text-yellow-700 dark:text-yellow-400">
                        You are viewing sample projects. <Link href="/login" className="font-bold underline">Log in</Link> or <Link href="/signup" className="font-bold underline">sign up</Link> to add and manage your own.
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
      )}

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="pt-6">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                    </CardContent>
                </Card>
            ))}
        </div>
      )}

      {!isLoading && allProjects && allProjects.length === 0 && !isReadOnly && (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-12">
            <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">You have no projects</h3>
                <p className="text-sm text-muted-foreground">Get started by adding your first project.</p>
                <AddProjectDialog>
                    <Button className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                    </Button>
                </AddProjectDialog>
            </div>
        </div>
      )}

      {!isLoading && allProjects && allProjects.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allProjects.map((project) => {
            const image = getPlaceholderImage(project.imageId);
            const projectLink = project.projectUrl || '#';
            
            return (
              <Card key={project.id} className="flex flex-col overflow-hidden">
                <Link href={projectLink} target="_blank" rel="noopener noreferrer">
                  {image && (
                      <Image
                        src={image.imageUrl}
                        alt={project.name}
                        width={600}
                        height={400}
                        data-ai-hint={image.imageHint}
                        className="aspect-video w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                  )}
                </Link>
                <CardHeader>
                  <CardTitle className="font-headline text-lg">
                    <Link href={projectLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {project.name}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3 h-[60px]">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies?.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                    {project.projectUrl && (
                        <Link href={project.projectUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}>
                            <ExternalLink className="mr-2 h-4 w-4" /> View Project
                        </Link>
                    )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
