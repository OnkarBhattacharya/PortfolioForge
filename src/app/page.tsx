'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, Sparkles, Star } from 'lucide-react';

const highlights = [
  'AI-powered CV and LinkedIn parsing',
  'One-click GitHub project import',
  'Professional themes with custom branding',
  'Public portfolio with your own domain',
];

const steps = [
  {
    title: 'Import your data',
    description: 'Upload a CV, paste LinkedIn text, or pull GitHub repos.',
  },
  {
    title: 'Refine with AI',
    description: 'Generate summaries and polish your story in minutes.',
  },
  {
    title: 'Publish instantly',
    description: 'Launch a clean, shareable portfolio on a custom domain.',
  },
];

const testimonials = [
  {
    quote:
      'I had a live portfolio in under 20 minutes. The AI summary reads like I hired a copywriter.',
    name: 'A. Patel',
    role: 'Product Designer',
  },
  {
    quote:
      'The GitHub import saved me hours. It turns repos into client-ready case studies.',
    name: 'J. Nguyen',
    role: 'Full-Stack Engineer',
  },
  {
    quote:
      'The themes look expensive, and the editing flow is clean. I finally like sharing my portfolio.',
    name: 'M. Rivera',
    role: 'Marketing Lead',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_hsl(var(--primary))_0%,_transparent_55%)] opacity-20" />
        <div className="hero-orb-accent" />
        <div className="hero-orb-primary" />

        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="font-headline text-xl font-semibold tracking-tight">
            PortfolioForge
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Log in
            </Link>
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </nav>
        </header>

        <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-6 pb-20 pt-10 md:pt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary animate-[fade-up_0.6s_ease-out]">
            <Sparkles className="h-4 w-4" />
            AI-native portfolio builder
          </div>
          <div className="grid w-full gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6 animate-[fade-up_0.8s_ease-out]">
              <h1 className="font-headline text-4xl font-bold tracking-tight md:text-6xl">
                Launch a portfolio that feels premium — in a single afternoon.
              </h1>
              <p className="max-w-xl text-base text-muted-foreground md:text-lg">
                Import your CV, LinkedIn, and GitHub in minutes. Let AI craft
                clean, persuasive narratives. Publish a portfolio clients
                actually want to read.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/signup">
                    Start free <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/pricing">Compare plans</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Publish in under 30 minutes
                </span>
              </div>
            </div>
            <div className="relative h-full animate-[fade-up_1s_ease-out]">
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur">
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary/10 text-primary">Live Preview</Badge>
                  <span className="text-xs text-muted-foreground">Updated today</span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="h-3 w-24 rounded-full bg-muted" />
                  <div className="h-6 w-3/4 rounded-full bg-foreground/80" />
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded-full bg-muted" />
                    <div className="h-3 w-5/6 rounded-full bg-muted" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                      <p className="text-xs text-muted-foreground">Projects</p>
                      <p className="text-lg font-semibold">12</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                      <p className="text-xs text-muted-foreground">Views</p>
                      <p className="text-lg font-semibold">3.4k</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 p-4">
                    <p className="text-xs text-muted-foreground">AI Summary</p>
                    <p className="text-sm font-medium">
                      “Product designer with a track record of shipping data-rich
                      experiences across fintech and health.”
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 hidden w-40 rounded-2xl border border-border/60 bg-background/90 p-4 shadow-lg md:block">
                <p className="text-xs text-muted-foreground">Premium Themes</p>
                <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-foreground">
                  <Star className="h-4 w-4 text-accent" />
                  18 ready to go
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-6 rounded-3xl border border-border/60 bg-card/60 p-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="font-headline text-2xl font-semibold">
              Everything you need to impress recruiters and clients.
            </h2>
            <p className="text-sm text-muted-foreground">
              PortfolioForge blends automation with tasteful design so your work
              stands out without hours of fiddling.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/80 px-4 py-3 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm"
            >
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                0{index + 1}
              </div>
              <h3 className="font-headline text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/90 p-6"
            >
              <div className="flex gap-1 text-accent">
                <Star className="h-4 w-4" />
                <Star className="h-4 w-4" />
                <Star className="h-4 w-4" />
                <Star className="h-4 w-4" />
                <Star className="h-4 w-4" />
              </div>
              <p className="text-sm text-foreground">{item.quote}</p>
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-accent/10 p-8 md:p-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-3">
              <h2 className="font-headline text-3xl font-semibold">
                Ready to publish something you&apos;re proud of?
              </h2>
              <p className="text-sm text-muted-foreground">
                Start free, import your data, and decide when you&apos;re ready to
                upgrade. Your portfolio goes live the moment you hit publish.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="lg">
                <Link href="/signup">Start free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
