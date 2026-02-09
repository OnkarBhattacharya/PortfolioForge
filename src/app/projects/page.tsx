
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, KeyRound, ExternalLink, Sparkles, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { collection, query } from 'firebase/firestore';
import AddPortfolioItemDialog from './add-project-dialog';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useMemo } from 'react';


type PortfolioItem = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  itemUrl?: string;
  imageId: string;
};

const sampleItems: PortfolioItem[] = [
    {
      "id": "gh-1",
      "name": "Corporate Rebranding Campaign",
      "description": "Led a full-scale corporate rebranding, including a new logo, website, and marketing materials. Increased brand recognition by 40%.",
      "tags": ["Branding", "Marketing Strategy", "Graphic Design"],
      "itemUrl": "#",
      "imageId": "project-1",
    },
    {
      "id": "gh-2",
      "name": "E-commerce SEO Optimization",
      "description": "Developed and executed an SEO strategy that resulted in a 200% increase in organic traffic and a 50% increase in online sales.",
      "tags": ["SEO", "Content Marketing", "Google Analytics"],
      "itemUrl": "#",
      "imageId": "project-2",
    },
    {
      "id": "gh-3",
      "name": "Mobile App UI/UX Design",
      "description": "Designed the complete user interface and user experience for a new mobile banking app, focusing on simplicity and accessibility.",
      "tags": ["UI/UX", "Figma", "Mobile Design", "User Research"],
      "itemUrl": "#",
      "imageId": "project-3",
    }
  ];

export default function PortfolioItemsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const isReadOnly = !user || user.isAnonymous;

  const itemsQuery = useMemoFirebase(() => {
    if (isReadOnly || !user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'portfolioItems')
    );
  }, [firestore, user, isReadOnly]);

  const { data: firestoreItems, isLoading: areItemsLoading } = useCollection<PortfolioItem>(itemsQuery);

  const isLoading = isUserLoading || areItemsLoading;

  const allItems = useMemo(() => {
    if (isReadOnly) {
        return sampleItems;
    }
    return firestoreItems || [];
  }, [firestoreItems, isReadOnly]);


  const totalItems = allItems?.length || 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tighter">
              My Portfolio
            </h1>
            <p className="text-sm text-muted-foreground">
              Curate your best work and publish case-study quality projects.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/import-data">
                <UploadCloud className="mr-2 h-4 w-4" /> Import data
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/ai-assistant">
                <Sparkles className="mr-2 h-4 w-4" /> AI Assistant
              </Link>
            </Button>
            <AddPortfolioItemDialog>
              <Button disabled={isReadOnly}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </AddPortfolioItemDialog>
          </div>
        </div>
      </div>

       {isReadOnly && (
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50">
            <CardHeader className="flex flex-row items-center gap-4">
                <KeyRound className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                <div>
                    <CardTitle className="font-headline text-yellow-800 dark:text-yellow-300">Read-Only Mode</CardTitle>
                    <CardDescription className="text-yellow-700 dark:text-yellow-400">
                        You are viewing sample portfolio items. <Link href="/login" className="font-bold underline">Log in</Link> or <Link href="/signup" className="font-bold underline">sign up</Link> to add and manage your own.
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Total items</p>
            <p className="text-2xl font-semibold">{totalItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Portfolio status</p>
            <p className="text-2xl font-semibold">
              {totalItems > 0 ? 'Active' : 'Draft'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Next step</p>
            <p className="text-2xl font-semibold">
              {totalItems > 2 ? 'Publish' : 'Add items'}
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading && !isReadOnly && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="pt-6">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                    </CardContent>
                </Card>
            ))}
        </div>
      )}

      {!isLoading && allItems && allItems.length === 0 && !isReadOnly && (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-12">
            <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">You have no portfolio items</h3>
                <p className="text-sm text-muted-foreground">Get started by adding your first item.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <AddPortfolioItemDialog>
                      <Button>
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                      </Button>
                  </AddPortfolioItemDialog>
                  <Button asChild variant="outline">
                    <Link href="/import-data">
                      <UploadCloud className="mr-2 h-4 w-4" /> Import data
                    </Link>
                  </Button>
                </div>
            </div>
        </div>
      )}

      {(!isLoading || isReadOnly) && allItems && allItems.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allItems.map((item) => {
            const image = getPlaceholderImage(item.imageId);
            const itemLink = item.itemUrl || '#';
            
            return (
              <Card key={item.id} className="flex flex-col overflow-hidden">
                <Link href={itemLink} target="_blank" rel="noopener noreferrer">
                  {image && (
                      <Image
                        src={image.imageUrl}
                        alt={item.name}
                        width={600}
                        height={400}
                        data-ai-hint={image.imageHint}
                        className="aspect-video w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                  )}
                </Link>
                <CardHeader>
                  <CardTitle className="font-headline text-lg">
                    <Link href={itemLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {item.name}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3 h-[60px]">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {item.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                    {item.itemUrl && (
                        <Link href={item.itemUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}>
                            <ExternalLink className="mr-2 h-4 w-4" /> View Item
                        </Link>
                    )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
