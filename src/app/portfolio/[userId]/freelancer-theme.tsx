
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Globe, Github, Linkedin, Mail, Plus, Sparkles, MapPin } from 'lucide-react';
import Image from 'next/image';
import type { UserProfile, PortfolioItem } from './page';
import { ContactForm } from './contact-form';

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

interface FreelancerThemeProps {
    profile: UserProfile;
    items: PortfolioItem[];
    theme: any;
}

export function FreelancerTheme({ profile, items, theme }: FreelancerThemeProps) {
  // Split summary into two paragraphs for the two-column layout
  const summarySentences = profile?.summary?.match(/[^.!?]+[.!?]+/g) || [];
  const midPoint = Math.ceil(summarySentences.length / 2);
  const summaryLeft = summarySentences.slice(0, midPoint).join(' ');
  const summaryRight = summarySentences.slice(midPoint).join(' ');

  return (
    <div className="min-h-screen bg-background font-body text-foreground" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      
      {/* Masthead */}
      <header className="relative overflow-hidden text-white" style={{ backgroundColor: `hsl(${theme.primary})` }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25)_0%,_transparent_55%)]" />
        <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="container mx-auto flex flex-col items-center px-4 py-24 text-center relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            Portfolio
          </div>
          <Avatar className="mx-auto h-40 w-40 mb-8 border-4 border-white shadow-lg">
            <AvatarImage src={`https://picsum.photos/seed/${profile.id}/200/200`} />
            <AvatarFallback>{profile.fullName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <h1 className="font-headline text-5xl md:text-6xl font-bold uppercase">{profile?.personalInfo?.name || profile.fullName || 'User Name'}</h1>
          <StarDivider className="my-6 text-white" />
          <p className="text-xl md:text-2xl font-light">{profile?.profession || 'A Passionate Professional'}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/80">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {profile?.personalInfo?.location || 'Planet Earth'}</span>
            <span>Open to new projects</span>
          </div>
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
                        className="aspect-video w-full rounded-lg object-cover shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-90">
                        <Plus className="h-16 w-16 text-white" />
                      </div>
                    </a>
                    <div className="mt-4">
                      <h3 className="font-headline text-xl">{item.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
             {(!items || items.length === 0) && (
                 <p className="text-center text-muted-foreground mt-8">This portfolio doesn't have any items yet.</p>
             )}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 text-white" style={{ backgroundColor: `hsl(${theme.primary})` }}>
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

        {/* Contact Section */}
        <section id="contact" className="py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-center font-headline text-4xl font-bold uppercase">Contact Me</h2>
                <StarDivider className="my-6 text-foreground" lineClassName="bg-foreground/50" />
                <div className="mx-auto max-w-2xl">
                    <ContactForm userId={profile.id} />
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-white" style={{ backgroundColor: `hsl(${theme.foreground})`}}>
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
              <p className="font-light leading-relaxed">PortfolioForge is an AI-powered portfolio builder for modern professionals.</p>
            </div>
          </div>
        </div>
        <div className="py-6" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <div className="container mx-auto px-4 text-center">
                <small>Copyright &copy; PortfolioForge {new Date().getFullYear()}</small>
            </div>
        </div>
      </footer>
    </div>
  );
}
