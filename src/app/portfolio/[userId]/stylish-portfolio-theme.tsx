'use client';

import { Button } from '@/components/ui/button';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Github, Linkedin, Mail, Menu, Phone, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { UserProfile, PortfolioItem } from './page';
import { ContactForm } from './contact-form';

interface StylishPortfolioThemeProps {
    profile: UserProfile;
    items: PortfolioItem[];
    theme: any;
}

export function StylishPortfolioTheme({ profile, items, theme }: StylishPortfolioThemeProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isPro = profile.subscriptionTier === 'pro' || profile.subscriptionTier === 'studio';

  const heroImage = getPlaceholderImage('project-4');

  const navLinks = [
    { href: '#page-top', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#portfolio', label: 'Portfolio' },
    { href: '#contact', label: 'Contact' },
  ];

  useEffect(() => {
    const handleScroll = (event: Event) => {
      const anchor = event.currentTarget as HTMLAnchorElement | null;
      const targetId = anchor?.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        event.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          setIsMenuOpen(false);
        }
      }
    };

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((anchor) => {
      anchor.addEventListener('click', handleScroll);
    });

    return () => {
      anchors.forEach((anchor) => {
        anchor.removeEventListener('click', handleScroll);
      });
    };
  }, []);

  return (
    <div id="page-top" className="min-h-screen bg-background font-body text-foreground" style={{ backgroundColor: `hsl(${theme.background})`, color: `hsl(${theme.foreground})` }}>
        {/* Navigation */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="fixed top-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-foreground/50 text-background">
            {isMenuOpen ? <X /> : <Menu />}
        </button>

        <aside className={`fixed top-0 right-0 z-40 h-full bg-foreground text-background transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{width: '18rem'}}>
            <nav className="flex h-full flex-col items-center justify-center space-y-4">
                 {navLinks.map(link => (
                    <a key={link.href} href={link.href} className="font-headline uppercase tracking-wider text-lg transition-colors hover:text-primary" onClick={() => setIsMenuOpen(false)}>{link.label}</a>
                ))}
            </nav>
        </aside>
        
        {/* Hero Section */}
        <header className="relative flex h-screen w-full items-center justify-center text-center text-foreground" 
            style={{ 
                backgroundImage: `url(${heroImage?.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background/60"></div>
            <div className="relative z-10 container mx-auto px-4">
                <h1 className="mb-4 text-5xl font-extrabold md:text-7xl">{profile.fullName || 'PortfolioForge'}</h1>
                <h3 className="mb-6 text-2xl italic md:text-3xl">{profile.profession || 'A Perfect Portfolio'}</h3>
                <p className="mx-auto mb-8 max-w-2xl text-sm text-muted-foreground md:text-base">
                    A curated portfolio of impactful work, product strategy, and premium experiences.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg font-bold tracking-wider text-primary-foreground hover:bg-primary/80">
                        <a href="#about">Find Out More</a>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg font-bold tracking-wider">
                        <a href="#portfolio">View Work</a>
                    </Button>
                </div>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
                    <span>Featured in product launches</span>
                    <span>Based in {profile.personalInfo?.location || 'Global'}</span>
                    <span>Open for collaborations</span>
                </div>
            </div>
        </header>

        <main>
            {/* About Section */}
            <section id="about" className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="mb-4 text-4xl font-bold">Stylish Portfolio is the perfect theme for your next project!</h2>
                    <p className="mb-8 text-lg text-muted-foreground">{profile.summary || "This theme features a flexible, UX friendly sidebar menu and stock photos from our friends at Unsplash!"}</p>
                    <Button asChild size="lg" className="rounded-full bg-secondary px-8 py-6 text-lg font-bold tracking-wider text-secondary-foreground hover:bg-secondary/80">
                        <a href="#services">What We Offer</a>
                    </Button>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="bg-primary py-20 text-primary-foreground">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="mb-2 text-lg font-bold uppercase">Services</h3>
                    <h2 className="mb-12 text-4xl font-bold">What I Offer</h2>
                    <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                        {(profile.skills?.slice(0, 4) || ['Responsive Design', 'Web Development', 'UI/UX', 'SEO']).map((skill, index) => (
                            <div key={index} className="flex flex-col items-center rounded-3xl bg-background/10 p-6">
                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-background text-primary">
                                    <Phone className="h-10 w-10" />
                                </div>
                                <h3 className="mb-2 text-2xl font-bold">{skill}</h3>
                                <p className="text-sm text-primary-foreground/80">Premium delivery with a focus on clarity, performance, and polish.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Callout Section */}
            <section className="bg-cover bg-center py-24 text-center text-foreground" style={{backgroundImage: `url(${getPlaceholderImage('project-2')?.imageUrl})`}}>
                 <div className="relative z-10 container mx-auto px-4">
                    <h2 className="text-5xl font-extrabold">The future of your <br/> professional online presence.</h2>
                    <Button asChild size="lg" className="mt-8 rounded-full bg-primary px-8 py-6 text-lg text-primary-foreground">
                        <a href={profile.githubUrl || profile.linkedinUrl || '#'}>View My Work</a>
                    </Button>
                </div>
            </section>

            {/* Portfolio Section */}
            <section id="portfolio" className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="mb-2 text-lg font-bold uppercase text-primary">Portfolio</h3>
                    <h2 className="mb-12 text-4xl font-bold">Recent Projects</h2>
                    <div className="grid gap-8 md:grid-cols-2">
                        {items.slice(0,4).map(item => {
                            const image = getPlaceholderImage(item.imageId);
                            return (
                                <div key={item.id} className="group relative aspect-video cursor-pointer bg-background shadow-md">
                                    <a href={item.itemUrl || '#'} target="_blank" rel="noopener noreferrer">
                                        <Image
                                            src={image?.imageUrl || ''}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-4 text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                            <h3 className="text-2xl font-bold">{item.name}</h3>
                                            <p>{item.description}</p>
                                        </div>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                     {(!items || items.length === 0) && (
                        <p className="mt-8 text-center text-muted-foreground">This portfolio doesn't have any items yet.</p>
                    )}
                </div>
            </section>

            {/* Highlight Section */}
            <section className="bg-muted/30 py-20">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="rounded-3xl border border-border/60 bg-background p-6">
                            <h4 className="mb-2 text-sm font-bold uppercase text-primary">Client Wins</h4>
                            <p className="text-lg font-semibold">+120% conversion lift</p>
                            <p className="mt-2 text-sm text-muted-foreground">Optimized onboarding and feature discovery for a fintech launch.</p>
                        </div>
                        <div className="rounded-3xl border border-border/60 bg-background p-6">
                            <h4 className="mb-2 text-sm font-bold uppercase text-primary">Featured Work</h4>
                            <p className="text-lg font-semibold">Global SaaS redesign</p>
                            <p className="mt-2 text-sm text-muted-foreground">Scaled a design system across 10+ product teams.</p>
                        </div>
                        <div className="rounded-3xl border border-border/60 bg-background p-6">
                            <h4 className="mb-2 text-sm font-bold uppercase text-primary">Availability</h4>
                            <p className="text-lg font-semibold">Now booking Q2</p>
                            <p className="mt-2 text-sm text-muted-foreground">Open to select freelance and advisory engagements.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-bold uppercase">Contact</h2>
                        <p className="text-muted-foreground">Let's Get In Touch!</p>
                    </div>
                    <div className="mx-auto grid max-w-4xl grid-cols-1 items-center gap-8 md:grid-cols-2">
                        <ContactForm userId={profile.id} />
                        <div className="flex flex-col items-center text-center">
                           <Phone className="mb-4 h-8 w-8 text-primary" />
                           <h4 className="mb-2 text-xl font-bold">Phone</h4>
                           <p className="mb-4 text-muted-foreground">{profile.personalInfo?.phone || '(123) 456-7890'}</p>
                           <Mail className="mb-4 h-8 w-8 text-primary" />
                           <h4 className="mb-2 text-xl font-bold">Email</h4>
                           <a href={`mailto:${profile.email}`} className="text-primary hover:underline">{profile.email}</a>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <footer className="py-16 text-center">
            <div className="container mx-auto px-4">
                <div className="mb-8 flex justify-center gap-4">
                    {profile.linkedinUrl && <a href={profile.linkedinUrl} className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/80"><Linkedin /></a>}
                    {profile.githubUrl && <a href={profile.githubUrl} className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/80"><Github /></a>}
                </div>
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {profile.fullName || 'Your Name'}. All Rights Reserved.</p>
                {!isPro && (
                  <p className="mt-3 text-xs text-muted-foreground">Powered by PortfolioForge</p>
                )}
                 <div className="mt-4 text-xs text-muted-foreground">
                    <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
                    <span className="mx-2">·</span>
                    <Link href="/terms-and-conditions" className="hover:text-primary">Terms of Use</Link>
                </div>
            </div>
        </footer>

    </div>
  );
}