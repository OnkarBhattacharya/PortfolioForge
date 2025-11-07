
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { Check, CheckCircle, KeyRound, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

type UserProfile = {
  id: string;
  subscriptionTier?: 'free' | 'pro';
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
};

const sampleInvoices = [
  {
    id: 'INV-2024-001',
    date: 'July 1, 2024',
    amount: '$12.00',
    status: 'Paid',
  },
  {
    id: 'INV-2024-002',
    date: 'August 1, 2024',
    amount: '$12.00',
    status: 'Paid',
  },
  {
    id: 'INV-2024-003',
    date: 'September 1, 2024',
    amount: '$12.00',
    status: 'Paid',
  },
];

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

  const currentTier = userProfile?.subscriptionTier || 'free';
  const currentStatus = userProfile?.subscriptionStatus;
  const endDate = userProfile?.subscriptionPeriodEndDate
    ? new Date(userProfile.subscriptionPeriodEndDate).toLocaleDateString()
    : null;

  const handleManageSubscription = () => {
    setIsLoading(true);
    // This is a placeholder. In a real application, this would redirect to a Stripe or PayPal billing portal.
    toast({
      title: 'Opening Subscription Portal...',
      description:
        'You would normally be redirected to manage your subscription.',
    });
    setTimeout(() => setIsLoading(false), 2000);
  };
  
    const handleUpgrade = (tier: 'free' | 'pro') => {
    if (isReadOnly) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in or sign up to upgrade your plan.",
      });
      return;
    }
    setIsLoading(true);
    toast({
      title: `Upgrading to ${Tiers[tier].name}...`,
      description: 'Please wait while we process your request.',
    });
    // Placeholder for actual payment processing
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Upgrade Successful!',
        description: `You are now on the ${Tiers[tier].name} plan.`,
      });
    }, 2000);
  };


  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          Billing & Subscription
        </h1>
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
          <CardContent className="grid gap-6 md:grid-cols-2">
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

            <Card className={currentTier === 'pro' ? 'border-primary' : ''}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Current Plan</CardTitle>
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
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Payment Method</CardTitle>
            <CardDescription>
              Manage your payment information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card className="flex items-center justify-between p-4 bg-muted/50">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-semibold">Visa ending in 4242</p>
                  <p className="text-sm text-muted-foreground">
                    Expires 12/2028
                  </p>
                </div>
              </div>
              <Button variant="outline" disabled>
                Update
              </Button>
            </Card>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Billing History</CardTitle>
            <CardDescription>
              View and download your past invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>
                      <Badge>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" disabled>
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
