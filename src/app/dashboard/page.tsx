'use client';

export const dynamic = 'force-dynamic';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle, Circle, KeyRound, Settings, UploadCloud, Sparkles, CodeXml } from 'lucide-react';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { useEffect, useState } from 'react';
import { useUser, useSupabase } from '@/hooks/use-supabase';
import { z } from 'zod';
import { CvDataSchema } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type CvData = z.infer<typeof CvDataSchema>;

type UserProfile = {
  id: string;
  username?: string;
  full_name?: string;
  headline?: string;
  bio?: string;
  avatar_url?: string;
  subscription_tier?: 'free' | 'pro' | 'studio';
  custom_domain?: string;
  custom_domain_status?: 'pending' | 'active' | 'error';
} & Partial<CvData>;

type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  image_url: string | null;
  sort_order: number;
};

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const supabase = useSupabase();
  const isReadOnly = !user;
  const [isMounted, setIsMounted] = useState(false);

  const [dbItems, setDbItems] = useState<PortfolioItem[]>([]);
  const [areItemsLoading, setAreItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<Error | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<Error | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch portfolio items
  useEffect(() => {
    if (!user || isReadOnly) {
      setDbItems([]);
      setAreItemsLoading(false);
      return;
    }

    setAreItemsLoading(true);
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('user_id', user.id)
          .order('sort_order', { ascending: true })
          .limit(3);
        if (error) throw error;
        setDbItems(data || []);
      } catch (error) {
        setItemsError(error instanceof Error ? error : new Error('Failed to fetch items'));
      } finally {
        setAreItemsLoading(false);
      }
    };

    fetchItems();
  }, [user, isReadOnly, supabase]);

  // Fetch user profile
  useEffect(() => {
    if (!user || isReadOnly) {
      setUserProfile(null);
      setIsProfileLoading(false);
      return;
    }

    setIsProfileLoading(true);
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        setProfileError(error instanceof Error ? error : new Error('Failed to fetch profile'));
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, isReadOnly, supabase]);

  if (!isMounted || isUserLoading || (!isReadOnly && (isProfileLoading || areItemsLoading))) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="mt-2 h-4 w-full" />
            </CardHeader>
            <CardContent className="flex-1">
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="mt-2 h-4 w-full" />
            </CardHeader>
            <CardContent className="flex-1">
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="mt-2 h-4 w-full" />
            </CardHeader>
            <CardContent className="flex-1">
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isPro = userProfile?.subscription_tier === 'pro' || userProfile?.subscription_tier === 'studio';
  const portfolioUrl = userProfile?.username ? `${window.location.origin}/${userProfile.username}` : undefined;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">
            Welcome back, {userProfile?.full_name || user?.user_metadata?.full_name || 'there'}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your portfolio.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {userProfile?.custom_domain && (
            <Badge variant="secondary" className="gap-1.5">
              <KeyRound className="h-3 w-3" />
              <span>Custom Domain Active</span>
            </Badge>
          )}
          <Badge variant={isPro ? 'default' : 'secondary'}>
            {userProfile?.subscription_tier ? userProfile.subscription_tier.charAt(0).toUpperCase() + userProfile.subscription_tier.slice(1) : 'Free'} Plan
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Portfolio Status
            </CardTitle>
            <CardDescription>Your portfolio is live and accessible.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div>
              <p className="mb-4">
                {userProfile?.username ? (
                  <>
                    Your portfolio is live at: <br />
                    <a
                      href={portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline break-all"
                    >
                      {portfolioUrl}
                    </a>
                  </>
                ) : (
                  'Complete your profile to get your portfolio URL.'
                )}
              </p>
              {userProfile?.custom_domain && (
                <p className="mb-4">
                  Custom domain: <span className="font-medium">{userProfile.custom_domain}</span>
                </p>
              )}
              <div className="flex gap-2">
                {portfolioUrl && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={portfolioUrl} target="_blank" rel="noopener noreferrer">
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      View Portfolio
                    </Link>
                  </Button>
                )}
                <Button asChild variant="default" size="sm">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CodeXml className="h-5 w-5" />
              Portfolio Items
            </CardTitle>
            <CardDescription>Showcase your work and projects.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {dbItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No portfolio items yet.</p>
                <Button asChild size="sm">
                  <Link href="/import-data">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Import Data
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {dbItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      {item.image_url && (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          width={50}
                          height={50}
                          className="rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/import-data">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Add More Items
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Assistant
            </CardTitle>
            <CardDescription>Generate content with AI.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/ai-assistant">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Open AI Assistant
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Get help with content suggestions, theme generation, translations, and more.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}