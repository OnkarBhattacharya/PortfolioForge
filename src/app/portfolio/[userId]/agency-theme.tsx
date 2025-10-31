
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Briefcase, Github, GraduationCap, Linkedin, Mail, Menu, Plus, Twitter, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { UserProfile, PortfolioItem } from './page';
import { ContactForm } from './contact-form';

interface AgencyThemeProps {
    profile: UserProfile;
    items: PortfolioItem[];
    theme: any;
}

export function AgencyTheme({ profile, items, theme }: AgencyThemeProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const heroImage = getPlaceholderImage('project-4');

  const navLinks = [
    { href: '#services', label: 'Services' },
    { href: '#portfolio', label: 'Portfolio' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-background font-body text-foreground" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    <a href="#" className="font-headline text-2xl italic text-primary" style={{color: 'hsl(var(--primary))'}}>
                        {profile.fullName || 'PortfolioForge'}
                    </a>
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => (
                            <a key={link.href} href={link.href} className="font-headline uppercase tracking-wider text-sm hover:text-primary transition-colors">{link.label}</a>
                        ))}
                    </div>
                    <div className="md:hidden">
                        <Button variant="outline" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X/> : <Menu />}
                        </Button>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden bg-background">
                    <div className="flex flex-col items-center space-y-4 py-4">
                         {navLinks.map(link => (
                            <a key={link.href} href={link.href} className="font-headline uppercase tracking-wider text-sm hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>{link.label}</a>
                        ))}
                    </div>
                </div>
            )}
        </nav>
        
        {/* Hero Section */}
        <header className="relative h-screen w-full flex items-center justify-center text-center text-white" 
            style={{ 
                backgroundImage: `url(${heroImage?.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative container mx-auto px-4 z-10">
                <h2 className="font-headline text-3xl md:text-4xl italic mb-4">Welcome To Our Studio!</h2>
                <h1 className="text-5xl md:text-7xl font-extrabold uppercase mb-8">{profile.profession || "It's Nice To Meet You"}</h1>
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-8 py-6 text-lg uppercase font-bold tracking-wider">
                    <a href="#portfolio">Tell Me More</a>
                </Button>
            </div>
        </header>

        <main>
            {/* Services Section */}
            <section id="services" className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold uppercase mb-4">Services</h2>
                    <p className="text-muted-foreground text-lg italic mb-12">What I can offer.</p>
                    <div className="grid md:grid-cols-3 gap-12">
                        {(profile.skills?.slice(0, 3) || ['Web Design', 'Development', 'SEO']).map((skill, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-24 w-24 rounded-full border-4 border-primary mb-4" style={{borderColor: `hsl(${theme.primary})`}}>
                                    <Briefcase className="h-12 w-12 text-primary" style={{color: `hsl(${theme.primary})`}} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{skill}</h3>
                                <p className="text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minima maxime quam architecto quo inventore harum ex magni, dicta impedit.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Portfolio Section */}
            <section id="portfolio" className="py-20 bg-muted/20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold uppercase mb-4">Portfolio</h2>
                    <p className="text-muted-foreground text-lg italic mb-12">My recent work.</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {items.map(item => {
                            const image = getPlaceholderImage(item.imageId);
                            return (
                                <div key={item.id} className="group relative cursor-pointer bg-background p-4 rounded-lg shadow-md">
                                    <a href={item.itemUrl || '#'} target="_blank" rel="noopener noreferrer">
                                        <Image
                                            src={image?.imageUrl || ''}
                                            alt={item.name}
                                            width={600}
                                            height={400}
                                            className="aspect-[4/3] w-full object-cover rounded-md"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-90">
                                            <Plus className="h-16 w-16 text-white" />
                                        </div>
                                    </a>
                                    <div className="pt-4 text-center">
                                        <h3 className="text-xl font-bold">{item.name}</h3>
                                        <p className="text-muted-foreground italic">{item.tags.join(', ')}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold uppercase mb-4">About</h2>
                    <p className="text-muted-foreground text-lg italic mb-12">My professional journey.</p>
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-1/2 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
                        
                        {/* Experience Items */}
                        {profile.experience?.map((exp, index) => (
                             <div key={`exp-${index}`} className="relative mb-12">
                                <div className={cn("flex w-full items-center", index % 2 === 0 ? "justify-start" : "justify-end")}>
                                    <div className={cn("w-1/2", index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left")}>
                                        <p className="text-muted-foreground">{exp.startDate} - {exp.endDate}</p>
                                        <h3 className="text-2xl font-bold">{exp.company}</h3>
                                        <p className="italic">{exp.jobTitle}</p>
                                    </div>
                                </div>
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-24 w-24 items-center justify-center rounded-full bg-primary border-4 border-background" style={{backgroundColor: `hsl(${theme.primary})`}}>
                                    <Briefcase className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        ))}

                        {/* Education Items */}
                        {profile.education?.map((edu, index) => (
                             <div key={`edu-${index}`} className="relative mb-12">
                                <div className={cn("flex w-full items-center", (profile.experience?.length || 0 + index) % 2 === 0 ? "justify-start" : "justify-end")}>
                                    <div className={cn("w-1/2", (profile.experience?.length || 0 + index) % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left")}>
                                        <p className="text-muted-foreground">{edu.graduationDate}</p>
                                        <h3 className="text-2xl font-bold">{edu.institution}</h3>
                                        <p className="italic">{edu.degree}</p>
                                    </div>
                                </div>
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-24 w-24 items-center justify-center rounded-full bg-primary border-4 border-background" style={{backgroundColor: `hsl(${theme.primary})`}}>
                                    <GraduationCap className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Contact Section */}
            <section id="contact" className="py-20 bg-muted/20">
                 <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold uppercase mb-4">Contact Me</h2>
                    <p className="text-muted-foreground text-lg italic mb-12">I'd love to hear from you.</p>
                     <div className="mx-auto max-w-2xl">
                        <ContactForm userId={profile.id} />
                    </div>
                </div>
            </section>
        </main>

        <footer className="py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <span className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {profile.fullName || 'Your Name'}. All Rights Reserved.</span>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        {profile.linkedinUrl && <Link href={profile.linkedinUrl}><Linkedin className="h-6 w-6 hover:text-primary"/></Link>}
                        {profile.githubUrl && <Link href={profile.githubUrl}><Github className="h-6 w-6 hover:text-primary"/></Link>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-4 md:mt-0">
                        <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
                        <span className="mx-2">·</span>
                        <Link href="/terms-and-conditions" className="hover:text-primary">Terms of Use</Link>
                    </div>
                </div>
            </div>
        </footer>

    </div>
  );
}
