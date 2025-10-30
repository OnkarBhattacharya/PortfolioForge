
'use client';
import { useEffect, useMemo } from 'react';
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
import { Github, Linkedin, Mail, ExternalLink, Loader2, Briefcase, GraduationCap, Twitter, Layers3 } from 'lucide-react';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { themes as staticThemes } from '@/lib/data';
import { z } from 'zod';
import { CvDataSchema } from '@/lib/types';
import Link from 'next/link';

type CvData = z.infer<typeof CvDataSchema>;

type UserProfile = {
  id: string;
  fullName?: string;
  email?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  themeId?: string;
  cv?: CvData;
};

type PortfolioItem = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  itemUrl?: string;
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
    cv: {
      personalInfo: {
        name: 'Alex Doe',
        email: 'alex.doe@example.com',
      },
      profession: 'Multi-disciplinary Professional',
      summary: 'A passionate professional with a love for creating beautiful and functional work, experienced in multiple domains.',
      experience: [
        {
          jobTitle: 'Senior Product Designer',
          company: 'Innovate Inc.',
          location: 'San Francisco, CA',
          startDate: 'Jan 2020',
          endDate: 'Present',
          responsibilities: ['Led the design of a new mobile application.', 'Conducted user research and usability testing.'],
        },
      ],
      education: [
        {
          degree: 'Bachelor of Arts in Design',
          institution: 'Creative University',
          graduationDate: 'May 2019',
        },
      ],
      skills: ['UI/UX Design', 'Product Strategy', 'User Research', 'Figma'],
    }
};

const sampleItems: PortfolioItem[] = [
    {
        id: 'sample-1',
        name: 'Corporate Rebranding Campaign',
        description: 'Led a full-scale corporate rebranding, including a new logo, website, and marketing materials. Increased brand recognition by 40%.',
        tags: ['Branding', 'Marketing', 'Design'],
        itemUrl: '#',
        imageId: 'project-5',
    },
    {
        id: 'sample-2',
        name: 'Data-driven SEO Strategy',
        description: 'A real-time analytics dashboard that provides insightful visualizations for complex datasets, helping businesses make data-driven decisions.',
        tags: ['SEO', 'Analytics', 'Content Strategy'],
        itemUrl: '#',
        imageId: 'project-2',
    },
    {
        id: 'sample-3',
        name: 'Mobile App UI/UX',
        description: 'A web application that uses a powerful AI model to generate concise summaries of long articles, saving users time and effort.',
        tags: ['UI/UX', 'Figma', 'Mobile Design'],
        itemUrl: '#',
        imageId: 'project-3',
    }
];

export default function PortfolioPage({ params: { userId } }: { params: { userId: string } }) {
  const { firestore } = useFirebase();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);
  
  const { data: dbProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);
  const cvData = dbProfile?.cv;

  const themeDocRef = useMemoFirebase(() => {
    if (!firestore || !dbProfile?.themeId) return null;
    return doc(firestore, 'themes', dbProfile.themeId);
  }, [firestore, dbProfile?.themeId]);

  const { data: theme, isLoading: isThemeLoading } = useDoc<Theme>(themeDocRef);

  const itemsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'users', userId, 'portfolioItems'));
  }, [firestore, userId]);

  const { data: dbItems, isLoading: areItemsLoading } = useCollection<PortfolioItem>(itemsQuery);
  
  const isLoading = isProfileLoading || isThemeLoading || areItemsLoading;
  
  const profile = !isLoading && !dbProfile && !profileError ? sampleProfile : dbProfile;
  const items = !isLoading && (!dbItems || dbItems.length === 0) && !profileError ? sampleItems : dbItems;
  
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
  
  const portfolioCvData = cvData || sampleProfile.cv;

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="container mx-auto px-4 py-16 text-center">
        <Avatar className="mx-auto h-32 w-32 border-4 border-primary shadow-lg">
          <AvatarImage src={`https://picsum.photos/seed/${profile.id}/200/200`} />
          <AvatarFallback>{profile.fullName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <h1 className="mt-6 font-headline text-5xl font-bold">{portfolioCvData?.personalInfo?.name || profile.fullName || 'User Name'}</h1>
        <p className="mt-2 text-xl text-muted-foreground">{portfolioCvData?.profession || 'A passionate professional with a love for creating beautiful and functional web applications.'}</p>
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
                    {portfolioCvData?.summary || "Welcome to my portfolio! I'm a dedicated professional specializing in building modern solutions. My experience spans from creating beautiful user interfaces to designing robust systems. I thrive on solving complex problems and am always eager to learn new things. This portfolio showcases some of my favorite work. Feel free to explore and get in touch!"}
                </p>
            </CardContent>
           </Card>
        </section>

        {portfolioCvData?.experience && portfolioCvData.experience.length > 0 && (
          <section id="experience" className="mb-16">
            <h2 className="mb-8 font-headline text-4xl font-bold text-primary">Work Experience</h2>
            <div className="space-y-8">
              {portfolioCvData.experience.map((job, index) => (
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

        {portfolioCvData?.education && portfolioCvData.education.length > 0 && (
            <section id="education" className="mb-16">
                <h2 className="mb-8 font-headline text-4xl font-bold text-primary">Education</h2>
                <div className="space-y-8">
                    {portfolioCvData.education.map((edu, index) => (
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

        {portfolioCvData?.skills && portfolioCvData.skills.length > 0 && (
            <section id="skills" className="mb-16">
                 <h2 className="mb-6 font-headline text-4xl font-bold text-primary">Skills</h2>
                <Card>
                    <CardContent className="flex flex-wrap gap-4 pt-6">
                        {portfolioCvData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-lg px-4 py-2">{skill}</Badge>
                        ))}
                    </CardContent>
                </Card>
            </section>
        )}

        <section id="projects">
          <h2 className="mb-6 font-headline text-4xl font-bold text-primary">Portfolio</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items?.map((item) => {
              const image = getPlaceholderImage(item.imageId);
              return (
                <Card key={item.id} className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={item.name}
                      width={600}
                      height={400}
                      className="aspect-video w-full object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="font-headline">{item.name}</CardTitle>
                    <CardDescription className="h-[60px] line-clamp-3">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <div className="mb-4 flex flex-wrap gap-2">
                        {item.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                  </CardContent>
                   <CardContent className="flex gap-2">
                      {item.itemUrl && <Button asChild className="flex-1"><a href={item.itemUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2" /> View Item</a></Button>}
                  </CardContent>
                </Card>
              );
            })}
             {!items || items.length === 0 && (
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <h3 className="text-xl font-bold">No portfolio items yet!</h3>
                        <p className="text-muted-foreground">Add your first item from the 'Portfolio' page to see it here.</p>
                    </CardContent>
                </Card>
             )}
          </div>
        </section>
      </main>
      <footer className="mt-16 bg-muted text-muted-foreground">
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Layers3 className="h-8 w-8 text-primary" />
                        <span className="font-headline text-2xl font-bold text-foreground">PortfolioForge</span>
                    </div>
                    <p className="text-sm">The intelligent portfolio platform for every professional.</p>
                </div>
                <div>
                    <h3 className="font-headline font-semibold text-foreground mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="hover:underline hover:text-primary">About Us</Link></li>
                        <li><Link href="#" className="hover:underline hover:text-primary">Contact Us</Link></li>
                        <li><Link href="#" className="hover:underline hover:text-primary">Features</Link></li>
                        <li><Link href="/login" className="hover:underline hover:text-primary">Login</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-headline font-semibold text-foreground mb-4">Follow Us</h3>
                    <div className="flex space-x-4">
                        <Link href="#" className="hover:text-primary"><Twitter className="h-6 w-6" /></Link>
                        <Link href="#" className="hover:text-primary"><Github className="h-6 w-6" /></Link>
                        <Link href="#" className="hover:text-primary"><Linkedin className="h-6 w-6" /></Link>
                    </div>
                </div>
            </div>
            <div className="mt-8 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
                <div className="flex gap-x-6 gap-y-2 flex-wrap justify-center md:justify-start mb-4 md:mb-0">
                    <Link href="/terms-and-conditions" className="hover:underline">Terms & Conditions</Link>
                    <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
                    <Link href="/cookie-policy" className="hover:underline">Cookie Policy</Link>
                </div>
                <p>&copy; {new Date().getFullYear()} PortfolioForge. All Rights Reserved.</p>
            </div>
             <p className="text-xs text-center mt-4">
                Disclaimer: This site is a project and should be treated as such. The content is for demonstration purposes only.
            </p>
        </div>
      </footer>
    </div>
  );
}

    