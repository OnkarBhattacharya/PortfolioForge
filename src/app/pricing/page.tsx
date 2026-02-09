'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Publish a clean portfolio fast.',
    features: [
      '1 portfolio',
      '3 portfolio items',
      'AI content suggestions',
      'Standard themes',
      'Hosted on portfolioforge.app',
    ],
    cta: 'Get started',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    description: 'For professionals who want to stand out.',
    features: [
      'Unlimited portfolio items',
      'Premium themes',
      'Custom domain',
      'Remove PortfolioForge branding',
      'Priority AI processing',
    ],
    cta: 'Upgrade to Pro',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Studio',
    price: '$29',
    description: 'Perfect for freelancers and small teams.',
    features: [
      'Multiple portfolios',
      'Client-ready case study layouts',
      'Team collaboration seats',
      'Dedicated support',
      'Brand kit presets',
    ],
    cta: 'Join waitlist',
    href: '/signup',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'Can I start for free?',
    answer:
      'Yes. The free plan lets you launch quickly and upgrade only when you need premium features.',
  },
  {
    question: 'What happens when I upgrade?',
    answer:
      'You unlock premium themes, custom domains, and unlimited items instantly. Your existing content stays intact.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'If you cancel within the first 7 days, we will issue a full refund. After that, your plan remains active until renewal.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
        <header className="flex flex-col gap-4">
          <Badge className="w-fit bg-primary/10 text-primary">Pricing</Badge>
          <h1 className="font-headline text-4xl font-bold md:text-5xl">
            Choose the plan that matches your momentum
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Start for free, upgrade when you&apos;re ready to remove branding and
            launch a premium portfolio experience.
          </p>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex h-full flex-col justify-between rounded-3xl border p-6 shadow-sm ${
                plan.highlighted
                  ? 'border-primary/60 bg-primary/5 shadow-lg'
                  : 'border-border/60 bg-card/80'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <h2 className="font-headline text-2xl font-semibold">
                    {plan.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                asChild
                className={`mt-6 w-full ${plan.highlighted ? '' : 'bg-accent text-accent-foreground'}`}
                variant={plan.highlighted ? 'default' : 'outline'}
              >
                <Link href={plan.href}>
                  {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <section className="mt-16 grid gap-6 rounded-3xl border border-border/60 bg-card/60 p-8 md:grid-cols-3">
          {faqs.map((item) => (
            <div key={item.question} className="space-y-2">
              <p className="font-semibold">{item.question}</p>
              <p className="text-sm text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </section>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-accent/10 p-8 md:flex-row md:items-center">
          <div className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold">
              Want a custom plan?
            </h2>
            <p className="text-sm text-muted-foreground">
              We can tailor pricing for teams or agencies. Let&apos;s talk.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/signup">Contact sales</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
