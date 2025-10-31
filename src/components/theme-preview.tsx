
'use client';
import { useEffect } from 'react';
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
import { Github, Linkedin, Mail, ExternalLink, Briefcase, GraduationCap } from 'lucide-react';
import Image from 'next/image';

type Theme = {
  id: string;
  name: string;
  description: string;
  previewImageUrl: string;
  price: number;
  isPremium: boolean;
  background: string;
  foreground: string;
  primary: string;
  accent: string;
};

interface ThemePreviewProps {
    theme: Theme;
}

const loremIpsum = {
    fullName: "John Doe",
    profession: "Lorem Ipsum Dolor Sit Amet",
    summary: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    experience: [
        {
            jobTitle: "Senior Developer",
            company: "Tech Solutions Inc.",
            location: "Metropolis, USA",
            startDate: "Jan 2020",
            endDate: "Present",
            responsibilities: [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "Ut enim ad minim veniam, quis nostrud exercitation ullamco."
            ]
        },
        {
            jobTitle: "Junior Developer",
            company: "Innovate Co.",
            location: "Gotham, USA",
            startDate: "Jun 2018",
            endDate: "Dec 2019",
            responsibilities: [
                "Duis aute irure dolor in reprehenderit in voluptate velit.",
                "Excepteur sint occaecat cupidatat non proident.",
            ]
        }
    ],
    education: [{
        institution: "State University",
        degree: "Bachelor of Science in Lorem Ipsum",
        graduationDate: "May 2018",
    }],
    skills: ["React", "TypeScript", "Node.js", "GraphQL", "Docker", "Figma", "Agile"],
    items: [
        {
            id: 'preview-1',
            name: 'Project Alpha',
            description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
            tags: ['React', 'Next.js'],
            itemUrl: '#',
            imageId: 'project-1',
        },
        {
            id: 'preview-2',
            name: 'Project Beta',
            description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            tags: ['Vue', 'Firebase'],
            itemUrl: '#',
            imageId: 'project-2',
        }
    ]
}


export function ThemePreview({ theme }: ThemePreviewProps) {

  const customStyles = {
    '--background': theme.background,
    '--foreground': theme.foreground,
    '--primary': theme.primary,
    '--accent': theme.accent,
    '--card': theme.background, 
    '--card-foreground': theme.foreground,
    '--popover': theme.background,
    '--popover-foreground': theme.foreground,
    '--secondary': theme.accent, 
    '--secondary-foreground': theme.foreground,
    '--muted': theme.accent,
    '--muted-foreground': `hsl(${theme.foreground}) / 0.7`,
    '--border': `hsl(${theme.foreground}) / 0.2`,
    '--input': `hsl(${theme.foreground}) / 0.2`,
    '--ring': theme.primary,
  } as React.CSSProperties;


  return (
    <div style={customStyles} className="bg-background font-body text-foreground p-4">
      <header className="container mx-auto px-4 py-8 text-center">
        <Avatar className="mx-auto h-24 w-24 border-4 border-primary shadow-lg">
          <AvatarImage src={`https://picsum.photos/seed/lorem-ipsum/200/200`} />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <h1 className="mt-4 font-headline text-4xl font-bold">{loremIpsum.fullName}</h1>
        <p className="mt-2 text-xl" style={{ color: 'hsl(var(--muted-foreground))' }}>{loremIpsum.profession}</p>
        <div className="mt-6 flex justify-center gap-4">
          <Button variant="outline"><Github className="mr-2" /> GitHub</Button>
          <Button variant="outline"><Linkedin className="mr-2" /> LinkedIn</Button>
          <Button variant="outline"><Mail className="mr-2" /> Email</Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <section id="about" className="mb-12">
          <h2 className="mb-4 font-headline text-3xl font-bold text-primary">About Me</h2>
           <Card>
            <CardContent className="pt-6">
                <p className="text-base leading-relaxed">
                    {loremIpsum.summary}
                </p>
            </CardContent>
           </Card>
        </section>

        <section id="experience" className="mb-12">
            <h2 className="mb-6 font-headline text-3xl font-bold text-primary">Work Experience</h2>
            <div className="space-y-6">
              {loremIpsum.experience.map((job, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-start gap-4">
                    <Briefcase className="h-6 w-6 text-accent" />
                    <div>
                      <CardTitle className="font-headline text-xl">{job.jobTitle}</CardTitle>
                      <CardDescription className="text-base">{job.company} &middot; {job.location}</CardDescription>
                      <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{job.startDate} - {job.endDate}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-1 pl-6">
                      {job.responsibilities?.map((res, i) => <li key={i}>{res}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
        </section>
        
        <section id="projects">
          <h2 className="mb-4 font-headline text-3xl font-bold text-primary">Portfolio</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {loremIpsum.items.map((item) => (
                <Card key={item.id} className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                    <div className="aspect-video w-full bg-muted flex items-center justify-center">
                        <p style={{ color: 'hsl(var(--muted-foreground))' }}>Placeholder Image</p>
                    </div>
                    <CardHeader>
                    <CardTitle className="font-headline">{item.name}</CardTitle>
                    <CardDescription className="h-[40px] line-clamp-2">{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                    <div className="flex flex-wrap gap-2">
                        {item.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                    </CardContent>
                    <CardContent className="flex gap-2">
                        <Button asChild className="flex-1"><a href={item.itemUrl}><ExternalLink className="mr-2" /> View Item</a></Button>
                    </CardContent>
                </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
