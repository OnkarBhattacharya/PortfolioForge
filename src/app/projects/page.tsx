
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
import { useCollection, useFirebase, useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Github, Loader2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { collection, query } from 'firebase/firestore';
import { useMemo } from 'react';
import AddProjectDialog from './add-project-dialog';
import { githubProjects } from '@/lib/data';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const getPlaceholderImage = (id: string) => {
    return PlaceHolderImages.find((img) => img.id === id);
};

export default function ProjectsPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  const projectsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'projects')
    );
  }, [firestore, user]);

  const { data: firestoreProjects, isLoading: areProjectsLoading } = useCollection<any>(projectsQuery as any);

  const isLoading = isUserLoading || areProjectsLoading;

  const allProjects = useMemo(() => {
    const combined = [...(firestoreProjects || [])];
    // A simple check to avoid duplicates if we were to implement full sync
    githubProjects.forEach(ghProject => {
      if (!combined.some(p => p.githubUrl === ghProject.githubUrl)) {
        combined.push(ghProject);
      }
    })
    return combined;
  }, [firestoreProjects]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          My Projects
        </h1>
        <AddProjectDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </AddProjectDialog>
      </div>

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

      {!isLoading && allProjects && allProjects.length === 0 && (
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
            const image = getPlaceholderImage(project.imageId) || getPlaceholderImage("project-1");
            return (
              <Card key={project.id} className="flex flex-col overflow-hidden">
                <Link href={project.liveDemoUrl || project.githubUrl || '#'} target="_blank" rel="noopener noreferrer">
                  {image && (
                      <Image
                        src={image.imageUrl}
                        alt={project.title}
                        width={600}
                        height={400}
                        data-ai-hint={image.imageHint}
                        className="aspect-video w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                  )}
                </Link>
                <CardHeader>
                  <CardTitle className="font-headline text-lg">
                    <Link href={project.liveDemoUrl || project.githubUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {project.title}
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
                    {project.source === 'github' && project.githubUrl && (
                        <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}>
                            <Github className="mr-2 h-4 w-4" /> View on GitHub
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
