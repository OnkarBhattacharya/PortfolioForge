'use client';
import { useEffect, useMemo } from 'react';
import {
  collection,
  doc,
  query,
} from 'firebase/firestore';
import { useFirebase, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Github, Linkedin, Mail, Loader2, Plus, Globe } from 'lucide-react';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { themes as staticThemes } from '@/lib/data';
import { z } from 'zod';
import { CvDataSchema } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type CvData = z.infer<typeof CvDataSchema>;

type UserProfile = {
  id: string;
  fullName?: string;
  email?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  themeId?: string;
} & Partial<CvData>;

type PortfolioItem = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  itemUrl?: string;
  imageId: string;
};

// Custom Star Divider Component inspired by the Freelancer theme
function StarDivider({ className, lineClassName, starClassName }: { className?: string, lineClassName?: string, starClassName?: string }) {
  return (
    <div className={cn("divider-custom flex items-center justify-center w-full", className)}>
      <div className={cn("divider-custom-line w-full h-1 bg-current rounded-full", lineClassName)} />
      <div className="divider-custom-icon px-4">
        <svg className={cn("h-7 w-7 text-current", starClassName)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
          <path d="M512 198.5l-177.2-25.7L256 12.5 177.2 172.8 0 198.5l128.2 125-30.3 176.5L256 420.3l158.1 80.2L483.8 323.5 512 198.5z" />
        </svg>
      </div>
      <div className={cn("divider-custom-line w-full h-1 bg-current rounded-full", lineClassName)} />
    </div>
  );
}

export default function PortfolioPage({ params: { userId } }: { params: { userId: string } }) {
  const { firestore } = useFirebase();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);
  
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);

  const themeDocRef = useMemoFirebase(() => {
    if (!firestore || !profile?.themeId) return null;
    return doc(firestore, 'themes', profile.themeId);
  }, [firestore, profile?.themeId]);

  const { data: theme, isLoading: isThemeLoading } = useDoc<any>(themeDocRef);

  const itemsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'users', userId, 'portfolioItems'));
  }, [firestore, userId]);

  const { data: items, isLoading: areItemsLoading } = useCollection<PortfolioItem>(itemsQuery);
  
  const isLoading = isProfileLoading || isThemeLoading || areItemsLoading;
  
  const selectedTheme = useMemo(() => {
    const themeId = profile?.themeId || 'freelancer-teal';
    return staticThemes.find(t => t.id === themeId) || staticThemes.find(t => t.id === 'freelancer-teal')!;
  }, [profile?.themeId]);


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
          <div className="flex h-screen w-full items-center justify-center" style={{ backgroundColor: `hsl(${selectedTheme.primary})`}}>
              <Loader2 className="h-16 w-16 animate-spin text-white" />
          </div>
      )
  }

  if (profileError || !profile) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Portfolio Not Found</h1>
                <p className="text-muted-foreground">This user profile could not be loaded.</p>
              </div>
          </div>
      )
  }
  
  // Split summary into two paragraphs for the two-column layout
  const summarySentences = profile?.summary?.match(/[^.!?]+[.!?]+/g) || [];
  const midPoint = Math.ceil(summarySentences.length / 2);
  const summaryLeft = summarySentences.slice(0, midPoint).join(' ');
  const summaryRight = summarySentences.slice(midPoint).join(' ');


  return (
    <div className="min-h-screen bg-background font-body text-foreground" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      
      {/* Masthead */}
      <header className="text-center text-white" style={{ backgroundColor: `hsl(${selectedTheme.primary})` }}>
        <div className="container mx-auto flex flex-col items-center px-4 py-24">
          <Avatar className="mx-auto h-40 w-40 mb-8 border-4 border-white shadow-lg">
            <AvatarImage src={`https://picsum.photos/seed/${profile.id}/200/200`} />
            <AvatarFallback>{profile.fullName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <h1 className="font-headline text-5xl md:text-6xl font-bold uppercase">{profile?.personalInfo?.name || profile.fullName || 'User Name'}</h1>
          <StarDivider className="my-6 text-white" />
          <p className="text-xl md:text-2xl font-light">{profile?.profession || 'A Passionate Professional'}</p>
        </div>
      </header>
      
      <main>
        {/* Portfolio Section */}
        <section id="portfolio" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-center font-headline text-4xl font-bold uppercase text-foreground">Portfolio</h2>
            <StarDivider className="my-6 text-foreground" lineClassName="bg-foreground/50" />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items?.map((item) => {
                const image = getPlaceholderImage(item.imageId);
                return (
                  <div key={item.id} className="group relative cursor-pointer">
                    <a href={item.itemUrl} target="_blank" rel="noopener noreferrer">
                      <Image
                        src={image?.imageUrl || `https://picsum.photos/seed/${item.id}/600/400`}
                        alt={item.name}
                        width={600}
                        height={400}
                        className="aspect-video w-full rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-90">
                        <Plus className="h-16 w-16 text-white" />
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
             {!isLoading && (!items || items.length === 0) && (
                 <p className="text-center text-muted-foreground mt-8">This portfolio doesn't have any items yet.</p>
             )}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 text-white" style={{ backgroundColor: `hsl(${selectedTheme.primary})` }}>
          <div className="container mx-auto px-4">
            <h2 className="text-center font-headline text-4xl font-bold uppercase">About</h2>
            <StarDivider className="my-6 text-white" />
            <div className="grid gap-8 md:grid-cols-2">
              <p className="text-lg font-light leading-relaxed">
                {summaryLeft || "This professional is skilled in creating amazing things. With a keen eye for detail and a passion for technology, they bring ideas to life."}
              </p>
              <p className="text-lg font-light leading-relaxed">
                {summaryRight || "Whether it's building a complex web application or designing a beautiful user interface, they are ready for any challenge. Feel free to get in touch!"}
              </p>
            </div>
             <div className="text-center mt-12">
                <Button asChild variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary transition-colors duration-300 px-6 py-6 text-lg">
                    <a href={profile.githubUrl || profile.linkedinUrl || `mailto:${profile.email}`}>
                        <Globe className="mr-2 h-5 w-5" />
                        Learn More
                    </a>
                </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-white" style={{ backgroundColor: `hsl(${selectedTheme.foreground})`}}>
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-12 text-center md:grid-cols-3 md:text-left">
            <div>
              <h4 className="mb-4 font-headline text-2xl font-bold uppercase">Location</h4>
              <p className="font-light leading-relaxed">{profile?.personalInfo?.location || "Planet Earth"}</p>
            </div>
            <div>
              <h4 className="mb-4 font-headline text-2xl font-bold uppercase">Around the Web</h4>
              <div className="flex justify-center gap-2 md:justify-start">
                  {profile.linkedinUrl && <a href={profile.linkedinUrl} className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white text-white hover:bg-white hover:text-foreground transition-colors"><Linkedin /></a>}
                  {profile.githubUrl && <a href={profile.githubUrl} className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white text-white hover:bg-white hover:text-foreground transition-colors"><Github /></a>}
                  {profile.email && <a href={`mailto:${profile.email}`} className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white text-white hover:bg-white hover:text-foreground transition-colors"><Mail /></a>}
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-headline text-2xl font-bold uppercase">About PortfolioForge</h4>
              <p className="font-light leading-relaxed">PortfolioForge is a free to use, AI-powered portfolio builder created by Google Studio.</p>
            </div>
          </div>
        </div>
        <div className="py-6" style={{ backgroundColor: `hsl(${selectedTheme.foreground}, 5%)` }}>
            <div className="container mx-auto px-4 text-center">
                <small>Copyright &copy; PortfolioForge {new Date().getFullYear()}</small>
            </div>
        </div>
      </footer>
    </div>
  );
}

    