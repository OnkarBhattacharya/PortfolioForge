import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { firebaseProjects, githubProjects } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowUpRight, Box, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const ProjectCard = ({ project }: { project: any }) => {
  const image = PlaceHolderImages.find((img) => img.id === project.imageId);
  return (
    <Card className="flex h-full flex-col">
      {image && (
         <Image
            src={image.imageUrl}
            alt={project.title}
            width={600}
            height={400}
            data-ai-hint={image.imageHint}
            className="aspect-video w-full rounded-t-lg object-cover"
          />
      )}
      <CardHeader>
        <CardTitle className="font-headline">{project.title}</CardTitle>
        <CardDescription className="line-clamp-3 min-h-[3.75rem]">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="secondary" className="w-full">
          <Link href={project.url}>
            View Project <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function ProjectsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          Projects
        </h1>
      </div>
      <Tabs defaultValue="github">
        <TabsList>
          <TabsTrigger value="github">
            <Github className="mr-2 h-4 w-4" /> GitHub
          </TabsTrigger>
          <TabsTrigger value="firebase">
            <Box className="mr-2 h-4 w-4" /> Firebase
          </TabsTrigger>
        </TabsList>
        <TabsContent value="github" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ProjectCard key="1" project={{
              id: '1',
              title: 'AI Portfolio Builder',
              description: 'Full-stack SaaS app with Firebase, Genkit AI, Stripe. Parses CVs, imports GitHub repos.',
              tags: ['Next.js', 'Firebase', 'Genkit', 'Stripe', 'TypeScript'],
              url: '#',
              imageId: '1'
            }} />
            <ProjectCard key="2" project={{
              id: '2',
              title: 'Real-time Chat App',
              description: 'WebRTC + Firebase chat with typing indicators and message history.',
              tags: ['React', 'Firebase', 'WebRTC', 'Tailwind'],
              url: '#',
              imageId: '2'
            }} />
            <ProjectCard key="3" project={{
              id: '3',
              title: 'E-commerce Dashboard',
              description: 'Admin dashboard with charts, real-time sales data, CRUD operations.',
              tags: ['Next.js', 'Chart.js', 'Prisma', 'PostgreSQL'],
              url: '#',
              imageId: '3'
            }} />
            <ProjectCard key="4" project={{
              id: '4',
              title: 'Task Management App',
              description: 'Kanban board with drag & drop, Firebase sync across devices.',
              tags: ['React', 'Firebase', 'Framer Motion'],
              url: '#',
              imageId: '4'
            }} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
