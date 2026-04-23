'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, KeyRound, Loader2, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';

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
    features: ['1 Portfolio', 'AI Content Suggestions', '3 Portfolio Items', 'Standard Themes'],
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
    features: ['Multiple portfolios', 'Client-ready case studies', 'Custom domain', 'Premium themes', 'Team collaboration'],
    unavailableFeatures: [],
  },
};

type PendingAction = 'checkout' | 'portal' | null;

export default function BillingPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const isReadOnly = !user || user.isAnonymous;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userProfileRef = useMemoFirebase(() => {
    if (isReadOnly || !user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user, isReadOnly]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const currentTier =
    userProfile?.subscriptionTier && userProfile.subscriptionTier in Tiers
      ? (userProfile.subscriptionTier as keyof typeof Tiers)
      : 'free';
  const currentStatus = userProfile?.subscriptionStatus;
  const endDate = userProfile?.subscriptionPeriodEndDate
    ? new Date(userProfile.subscriptionPeriodEndDate).toLocaleDateString()
    : null;

  const showLoadingState = !isMounted || isUserLoading || (!isReadOnly && isProfileLoading);

  const pendingLabel =
    pendingAction === 'checkout'
      ? 'Starting checkout...'
      : pendingAction === 'portal'
        ? 'Opening billing portal...'
        : null;

  const readResponseError = async (response: Response) => {
    const data = await response.json().catch(() => null);
    return data?.error || 'The billing service could not complete your request.';
  };

  const createStripeSession = async (
    endpoint: '/api/stripe/checkout' | '/api/stripe/portal',
    action: PendingAction,
    payload?: Record<string, unknown>
  ) => {
    if (pendingAction) {
      return;
    }

    if (!user || user.isAnonymous) {
      const message = 'Please log in or sign up to manage your billing.';
      setActionError(message);
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: message,
      });
      return;
    }

    setPendingAction(action);
    setActionError(null);

    try {
      const token = await user.getIdToken();
      if (!token) {
        throw new Error('Authentication required.');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload || {}),
      });

      if (!response.ok) {
        throw new Error(await readResponseError(response));
      }

      const data = await response.json().catch(() => null);
      if (!data?.url) {
        throw new Error('The billing service did not return a redirect URL.');
      }

      window.location.href = data.url;
    } catch (error: any) {
      const message = error instanceof Error && error.message ? error.message : 'Please try again later.';
      setActionError(message);
      toast({
        variant: 'destructive',
        title: action === 'portal' ? 'Portal unavailable' : 'Checkout unavailable',
        description: message,
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleManageSubscription = async () => {
    await createStripeSession('/api/stripe/portal', 'portal');
  };

  const handleUpgrade = async (tier: 'free' | 'pro' | 'studio') => {
    await createStripeSession('/api/stripe/checkout', 'checkout', { plan: tier });
  };

  if (showLoadingState) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-2 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <CardTitle className="font-headline">Loading billing</CardTitle>
            <CardDescription>Verifying your account and subscription details.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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

      {actionError && (
        <Alert variant="destructive">
          <AlertTitle className="font-headline">Billing action failed</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {pendingLabel && (
        <Alert>
          <AlertTitle className="font-headline">Processing request</AlertTitle>
          <AlertDescription>{pendingLabel}</AlertDescription>
        </Alert>
      )}

      {isReadOnly && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20">
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
            <CardDescription>Choose the plan that's right for you.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <Card className={currentTier === 'free' ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle className="font-headline">{Tiers.free.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">{Tiers.free.price}</span>
                  <span className="text-muted-foreground">/{Tiers.free.frequency}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  {Tiers.free.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" /> {feature}
                    </li>
                  ))}
                  {Tiers.free.unavailableFeatures.map((feature) => (
                    <li key={feature} className="flex items-center text-muted-foreground">
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
                  <span className="text-muted-foreground">/{Tiers.pro.frequency}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  {Tiers.pro.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" /> {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {currentTier === 'pro' ? (
                  <Button className="w-full" onClick={handleManageSubscription} disabled={!!pendingAction}>
                    {pendingAction === 'portal' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Manage Subscription
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => handleUpgrade('pro')} disabled={!!pendingAction || isReadOnly}>
                    {pendingAction === 'checkout' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
                  <span className="text-muted-foreground">/{Tiers.studio.frequency}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  {Tiers.studio.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" /> {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {currentTier === 'studio' ? (
                  <Button className="w-full" onClick={handleManageSubscription} disabled={!!pendingAction}>
                    {pendingAction === 'portal' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Manage Subscription
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => handleUpgrade('studio')} disabled={!!pendingAction || isReadOnly}>
                    {pendingAction === 'checkout' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
            <CardDescription>Track your subscription status and renewal date.</CardDescription>
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
              <p className="text-sm text-muted-foreground">
                No payment method on file. Upgrade to a paid plan to add one.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Payment details are managed securely through Stripe. Click "Manage Subscription" above to update your payment method.
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
              <p className="text-sm text-muted-foreground">
                No invoices yet. Invoices appear here after your first payment.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your full invoice history is available in the Stripe billing portal.
                </p>
                <Button onClick={handleManageSubscription} disabled={!!pendingAction} variant="outline">
                  {pendingAction === 'portal' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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