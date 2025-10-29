
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { githubProjects, firebaseProjects } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

const allProjects = [...githubProjects, ...firebaseProjects];

const getPlaceholderImage = (id: string) => {
    return PlaceHolderImages.find((img) => img.id === id);
};

export default function ProjectsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          My Projects
        </h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allProjects.map((project) => {
          const image = getPlaceholderImage(project.imageId);
          return (
            <Card key={project.id} className="overflow-hidden">
              <Link href={project.url} target="_blank" rel="noopener noreferrer">
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
                  <Link href={project.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {project.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3 h-[60px]">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
