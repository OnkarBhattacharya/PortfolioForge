
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
import { Github, Linkedin, Mail, ExternalLink, Briefcase, GraduationCap, Sparkles } from 'lucide-react';
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
    showBranding?: boolean;
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


export function ThemePreview({ theme, showBranding = true }: ThemePreviewProps) {
  const safeTheme = {
    background: theme?.background ?? '220 13% 95%',
    foreground: theme?.foreground ?? '222.2 84% 4.9%',
    primary: theme?.primary ?? '231 48% 48%',
    accent: theme?.accent ?? '174 100% 29%',
  };

  const customStyles = {
    '--background': safeTheme.background,
    '--foreground': safeTheme.foreground,
    '--primary': safeTheme.primary,
    '--accent': safeTheme.accent,
    '--card': safeTheme.background,
    '--card-foreground': safeTheme.foreground,
    '--popover': safeTheme.background,
    '--popover-foreground': safeTheme.foreground,
    '--secondary': safeTheme.accent,
    '--secondary-foreground': safeTheme.foreground,
    '--muted': safeTheme.accent,
    '--muted-foreground': `hsl(${safeTheme.foreground}) / 0.7`,
    '--border': `hsl(${safeTheme.foreground}) / 0.2`,
    '--input': `hsl(${safeTheme.foreground}) / 0.2`,
    '--ring': safeTheme.primary,
  } as React.CSSProperties;


  return (
    <div style={customStyles} className="bg-background font-body text-foreground">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary))_0%,_transparent_55%)] opacity-15" />
        <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,_hsl(var(--accent))_0%,_transparent_70%)] opacity-25 blur-3xl" />
        <header className="container mx-auto px-4 py-10">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                <Sparkles className="h-3 w-3" />
                Premium theme preview
              </div>
              <h1 className="font-headline text-4xl font-bold">{loremIpsum.fullName}</h1>
              <p className="text-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {loremIpsum.profession}
              </p>
              <p className="text-sm text-muted-foreground">
                Product-focused developer with a knack for bold visuals, clean
                UX, and modern engineering systems.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">View Portfolio</Button>
                <Button variant="outline">Download Resume</Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span>Based in Metropolis, USA</span>
                <span>Open to freelance</span>
                <span>Available Q2</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm"><Github className="mr-2" /> GitHub</Button>
                <Button variant="outline" size="sm"><Linkedin className="mr-2" /> LinkedIn</Button>
                <Button variant="outline" size="sm"><Mail className="mr-2" /> Email</Button>
              </div>
            </div>
            <div className="rounded-3xl border border-border/50 bg-card/70 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Portfolio stats</span>
                <span className="rounded-full bg-accent/20 px-2 py-1 text-xs text-accent">Updated today</span>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-primary shadow-lg">
                  <AvatarImage src={`https://picsum.photos/seed/lorem-ipsum/200/200`} />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground">Featured role</p>
                  <p className="font-semibold">Senior Developer</p>
                  <p className="text-xs text-muted-foreground">Tech Solutions Inc.</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-border/40 bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Projects</p>
                  <p className="text-lg font-semibold">12</p>
                </div>
                <div className="rounded-xl border border-border/40 bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Clients</p>
                  <p className="text-lg font-semibold">8</p>
                </div>
                <div className="rounded-xl border border-border/40 bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Years</p>
                  <p className="text-lg font-semibold">6+</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-border/40 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 p-4 text-sm">
                “Designing products that feel premium and ship faster.”
              </div>
            </div>
          </div>
        </header>
      </div>

      <main className="container mx-auto px-4 py-10">
        <section id="about" className="mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="mb-4 font-headline text-3xl font-bold text-primary">About Me</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-base leading-relaxed">
                  {loremIpsum.summary}
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">Core Skills</CardTitle>
              <CardDescription>Modern product engineering and design systems.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {loremIpsum.skills.map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
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
        <div className="container mx-auto px-4 py-6">
          {showBranding && (
            <div className="mt-8 rounded-xl border border-border/50 bg-background/80 px-4 py-3 text-center text-xs text-muted-foreground">
              Powered by PortfolioForge
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
