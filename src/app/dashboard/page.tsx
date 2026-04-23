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
import { ArrowUpRight, CheckCircle, Circle, KeyRound } from 'lucide-react';
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { useEffect, useState } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, limit, doc } from 'firebase/firestore';
import { z } from 'zod';
import { CvDataSchema } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type CvData = z.infer<typeof CvDataSchema>;

type UserProfile = {
  id: string;
} & Partial<CvData>;

type PortfolioItem = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  imageId: string;
};

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const isReadOnly = !user || user.isAnonymous;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // All hooks must be called unconditionally before any early return
  const itemsQuery = useMemoFirebase(() => {
    if (isReadOnly || !firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'portfolioItems'),
      limit(3)
    );
  }, [user, firestore, isReadOnly]);

  const { data: dbItems, isLoading: areItemsLoading } =
    useCollection<PortfolioItem>(itemsQuery);

  const userProfileQuery = useMemoFirebase(() => {
    if (isReadOnly || !firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore, isReadOnly]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileQuery);

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
            <CardContent>
              <Skeleton className="h-10 w-36" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-8 w-3/5" />
              <Skeleton className="mt-2 h-4 w-4/5" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-8 w-2/5" />
              <Skeleton className="mt-2 h-4 w-3/5" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-28" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <Skeleton className="aspect-video w-full object-cover" />
                <CardHeader>
                  <Skeleton className="h-7 w-4/5" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <Skeleton className="aspect-video w-full object-cover" />
                <CardHeader>
                  <Skeleton className="h-7 w-4/5" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <Skeleton className="aspect-video w-full object-cover" />
                <CardHeader>
                  <Skeleton className="h-7 w-4/5" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const recentItems = isReadOnly ? [] : dbItems;

  const hasProfileData =
    !!userProfile?.summary ||
    (userProfile?.experience?.length || 0) > 0 ||
    (userProfile?.education?.length || 0) > 0;
  const hasLinkedIn = !!userProfile?.personalInfo?.linkedin;
  const hasExternalLinks = (dbItems?.length || 0) > 0;

  const liveSiteUrl = user && !user.isAnonymous ? `/portfolio/${user.uid}` : `/login`;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          Dashboard
        </h1>
      </div>

      {isReadOnly && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20">
          <CardHeader className="flex flex-row items-center gap-4">
            <KeyRound className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
            <div>
              <CardTitle className="font-headline text-yellow-800 dark:text-yellow-300">
                Read-Only Mode
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-400">
                You are in read-only mode.{' '}
                <Link href="/login" className="font-bold underline">
                  Log in
                </Link>{' '}
                or{' '}
                <Link href="/signup" className="font-bold underline">
                  sign up
                </Link>{' '}
                to start building your portfolio.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Welcome to PortfolioForge
            </CardTitle>
            <CardDescription>
              Let&apos;s build your standout professional portfolio. Follow the steps
              below to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Import your data once, then refine your story with AI and publish
              a polished portfolio in minutes.
            </p>
          </CardContent>
          <CardContent>
            <Button asChild>
              <Link href="/import-data">
                Import Your Data
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">Profile Status</CardTitle>
            <CardDescription>
              Complete these steps to enrich your portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent>
          {isProfileLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
    ) : (
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-center">
                {isReadOnly ? (
                  <Circle className="mr-3 h-5 w-5 text-muted-foreground" />
                ) : (
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                )}
                <span>Account Created</span>
              </li>
              <li className="flex items-center">
                {hasProfileData && !isReadOnly ? (
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="mr-3 h-5 w-5 text-muted-foreground" />
                )}
                <span>CV/Resume Imported</span>
              </li>
              <li className="flex items-center">
                {hasLinkedIn && !isReadOnly ? (
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="mr-3 h-5 w-5 text-muted-foreground" />
                )}
                <span>LinkedIn Imported</span>
              </li>
              <li className="flex items-center">
                {hasExternalLinks && !isReadOnly ? (
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="mr-3 h-5 w-5 text-muted-foreground" />
                )}
                <span>Portfolio Items Added</span>
              </li>
            </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">Quick Links</CardTitle>
            <CardDescription>
              Jump to any section to manage your portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button variant="outline" asChild>
              <Link href="/projects">
                <span className="truncate">View Portfolio</span>
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/ai-assistant">
                <span className="truncate">AI Assistant</span>
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/settings">
                <span className="truncate">Settings</span>
              </Link>
            </Button>
            <Button asChild className="bg-accent text-accent-foreground">
              <Link href={liveSiteUrl}>
                <span className="truncate">View Live Site</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {isProfileLoading ? (
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-28" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        userProfile?.skills && userProfile.skills.length > 0 && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Your Top Skills</CardTitle>
              <CardDescription>
                These are the top skills identified from your profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {userProfile.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        )
      )}

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Portfolio Items</CardTitle>
            <CardDescription>
              A glimpse of your latest work. Add more from the portfolio page.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentItems?.map((item) => {
              const image = getPlaceholderImage(item.imageId);
              return (
                <Card key={item.id} className="overflow-hidden">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={item.name}
                      width={600}
                      height={400}
                      data-ai-hint={image.imageHint}
                      className="aspect-video w-full object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="font-headline text-lg">
                      {item.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {item.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {!areItemsLoading && (!recentItems || recentItems.length === 0) && (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <h3 className="text-xl font-bold">No portfolio items yet!</h3>
                  <p className="text-muted-foreground">
                    Add your first item from the &apos;Portfolio&apos; page to see it
                    here.
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
