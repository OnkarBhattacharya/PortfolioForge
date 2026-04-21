
'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { Check, KeyRound, Loader2, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

type UserProfile = {
  id: string;
  subscriptionTier?: 'free' | 'pro' | 'studio';
  subscriptionStatus?: 'active' | 'canceled' | 'past_due';
  subscriptionPeriodEndDate?: string;
};

const Tiers = {
  free: {
    name: 'Free',
    price: '$0',
    frequency: 'per month',
    features: [
      '1 Portfolio',
      'AI Content Suggestions',
      '3 Portfolio Items',
      'Standard Themes',
    ],
    unavailableFeatures: [
      'Unlimited Portfolio Items',
      'Custom Domain',
      'Premium Themes',
      'Remove PortfolioForge Branding',
    ],
  },
  pro: {
    name: 'Pro',
    price: '$12',
    frequency: 'per month',
    features: [
      'Unlimited Portfolios',
      'AI Content Suggestions',
      'Unlimited Portfolio Items',
      'Custom Domain',
      'Premium Themes',
      'Remove PortfolioForge Branding',
    ],
    unavailableFeatures: [],
  },
  studio: {
    name: 'Studio',
    price: '$29',
    frequency: 'per month',
    features: [
      'Multiple portfolios',
      'Client-ready case studies',
      'Custom domain',
      'Premium themes',
      'Team collaboration',
    ],
    unavailableFeatures: [],
  },
};



export default function BillingPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isReadOnly = !user || user.isAnonymous;

  const userProfileRef = useMemoFirebase(() => {
    if (isReadOnly || !user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user, isReadOnly]);

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userProfileRef);

  const currentTier = (userProfile?.subscriptionTier || 'free') as keyof typeof Tiers;
  const currentStatus = userProfile?.subscriptionStatus;
  const endDate = userProfile?.subscriptionPeriodEndDate
    ? new Date(userProfile.subscriptionPeriodEndDate).toLocaleDateString()
    : null;

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Authentication required.');
      }
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not open billing portal');
      }
      window.location.href = data.url;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Portal unavailable',
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
    const handleUpgrade = async (tier: 'free' | 'pro' | 'studio') => {
    if (isReadOnly) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in or sign up to upgrade your plan.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Authentication required.');
      }
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: tier }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not start checkout');
      }
      window.location.href = data.url;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Checkout unavailable',
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          Billing & Subscription
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your plan, payment method, and invoices in one place.
        </p>
      </div>

      {isReadOnly && (
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50">
          <CardHeader className="flex flex-row items-center gap-4">
            <KeyRound className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
            <div>
              <CardTitle className="font-headline text-yellow-800 dark:text-yellow-300">
                Read-Only Mode
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-400">
                Please{' '}
                <Link href="/login" className="font-bold underline">
                  log in
                </Link>{' '}
                or{' '}
                <Link href="/signup" className="font-bold underline">
                  sign up
                </Link>{' '}
                to manage your subscription.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Subscription Plans</CardTitle>
            <CardDescription>
              Choose the plan that's right for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <Card
              className={currentTier === 'free' ? 'border-primary' : ''}
            >
              <CardHeader>
                <CardTitle className="font-headline">
                  {Tiers.free.name}
                </CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">{Tiers.free.price}</span>
                  <span className="text-muted-foreground">
                    /{Tiers.free.frequency}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  {Tiers.free.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />{' '}
                      {feature}
                    </li>
                  ))}
                  {Tiers.free.unavailableFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center text-muted-foreground"
                    >
                      <X className="mr-2 h-4 w-4" /> {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={currentTier === 'free' ? 'default' : 'outline'}
                  disabled
                >
                  Current Plan
                </Button>
              </CardFooter>
            </Card>

            <Card className={`relative ${currentTier === 'pro' ? 'border-primary' : ''}`}>
              <div className="absolute right-4 top-4 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                Most popular
              </div>
              <CardHeader>
                <CardTitle className="font-headline">{Tiers.pro.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">{Tiers.pro.price}</span>
                  <span className="text-muted-foreground">
                    /{Tiers.pro.frequency}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  {Tiers.pro.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />{' '}
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {currentTier === 'pro' ? (
                  <Button
                    className="w-full"
                    onClick={handleManageSubscription}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Manage Subscription
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => handleUpgrade('pro')} disabled={isLoading || isReadOnly}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Upgrade to Pro
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card className={currentTier === 'studio' ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle className="font-headline">{Tiers.studio.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">{Tiers.studio.price}</span>
                  <span className="text-muted-foreground">
                    /{Tiers.studio.frequency}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  {Tiers.studio.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />{' '}
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {currentTier === 'studio' ? (
                  <Button
                    className="w-full"
                    onClick={handleManageSubscription}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Manage Subscription
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => handleUpgrade('studio')} disabled={isLoading || isReadOnly}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Upgrade to Studio
                  </Button>
                )}
              </CardFooter>
            </Card>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="font-headline">Current Plan</CardTitle>
            <CardDescription>
              Track your subscription status and renewal date.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {isProfileLoading && !isReadOnly ? (
                <Loader2 className="h-8 w-8 animate-spin" />
             ) : (
                <>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Your Plan</p>
                        <p className="text-lg font-semibold">{Tiers[currentTier].name}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-semibold">
                            {currentStatus === 'active' ? (
                                <Badge>Active</Badge>
                            ) : (
                                <Badge variant="secondary">{currentStatus || 'N/A'}</Badge>
                            )}
                        </p>
                    </div>
                    {endDate && (
                         <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Renews/Expires On</p>
                            <p className="font-semibold">{endDate}</p>
                         </div>
                    )}
                </>
             )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/pricing">
                <Sparkles className="mr-2 h-4 w-4" /> Compare plans
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Payment Method</CardTitle>
            <CardDescription>
              Manage your payment information via the Stripe billing portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentTier === 'free' ? (
              <p className="text-sm text-muted-foreground">No payment method on file. Upgrade to a paid plan to add one.</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Payment details are managed securely through Stripe. Click &quot;Manage Subscription&quot; above to update your payment method.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">Billing History</CardTitle>
            <CardDescription>
              View and download your past invoices via the Stripe portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentTier === 'free' ? (
              <p className="text-sm text-muted-foreground">No invoices yet. Invoices appear here after your first payment.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your full invoice history is available in the Stripe billing portal.
                </p>
                <Button onClick={handleManageSubscription} disabled={isLoading} variant="outline">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Open Billing Portal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
