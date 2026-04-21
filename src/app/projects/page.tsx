'use client';

export const dynamic = 'force-dynamic';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { collection, doc, query, deleteDoc } from 'firebase/firestore';
import { ArrowUpRight, KeyRound, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import AddPortfolioItemDialog from './add-project-dialog';
import { useToast } from '@/hooks/use-toast';

type PortfolioItem = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  itemUrl?: string;
  imageId: string;
};

const ProjectCard = ({
  project,
  onDelete,
}: {
  project: PortfolioItem;
  onDelete: (id: string) => void;
}) => {
  const image = getPlaceholderImage(project.imageId);
  return (
    <Card className="flex h-full flex-col">
      {image && (
        <Image
          src={image.imageUrl}
          alt={project.name}
          width={600}
          height={400}
          data-ai-hint={image.imageHint}
          className="aspect-video w-full rounded-t-lg object-cover"
        />
      )}
      <CardHeader>
        <CardTitle className="font-headline">{project.name}</CardTitle>
        <CardDescription className="line-clamp-3 min-h-[3.75rem]">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          {project.tags?.map((tag: string) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {project.itemUrl ? (
          <Button asChild variant="secondary" className="flex-1">
            <Link href={project.itemUrl} target="_blank" rel="noopener noreferrer">
              View Project <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button variant="secondary" className="flex-1" disabled>
            No URL
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(project.id)}
          aria-label="Delete project"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function ProjectsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const isReadOnly = !user || user.isAnonymous;

  const userProfileRef = useMemoFirebase(() => {
    if (isReadOnly || !user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore, isReadOnly]);

  const { data: userProfile } = useDoc<{ subscriptionTier?: 'free' | 'pro' | 'studio' }>(userProfileRef);

  const itemsQuery = useMemoFirebase(() => {
    if (isReadOnly || !user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'portfolioItems'));
  }, [user, firestore, isReadOnly]);

  const { data: items, isLoading: areItemsLoading } = useCollection<PortfolioItem>(itemsQuery);

  const isPro = userProfile?.subscriptionTier === 'pro' || userProfile?.subscriptionTier === 'studio';
  const maxFreeItems = 3;
  const itemCount = items?.length || 0;
  const canAdd = isPro || itemCount < maxFreeItems;

  const handleDelete = async (itemId: string) => {
    if (!firestore || !user) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'portfolioItems', itemId));
      toast({ title: 'Item deleted', description: 'Portfolio item removed successfully.' });
    } catch {
      toast({ variant: 'destructive', title: 'Delete failed', description: 'Could not delete the item.' });
    }
  };

  if (isUserLoading || areItemsLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tighter">Portfolio Items</h1>
          {!isPro && !isReadOnly && (
            <p className="text-sm text-muted-foreground">
              {itemCount}/{maxFreeItems} items used on free plan.{' '}
              <Link href="/billing" className="text-primary underline">
                Upgrade for unlimited.
              </Link>
            </p>
          )}
        </div>
        <AddPortfolioItemDialog
          canAdd={canAdd}
          limitMessage="Free plans are limited to 3 portfolio items. Upgrade to add more."
          nextIndex={itemCount}
        >
          <Button disabled={isReadOnly}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </AddPortfolioItemDialog>
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
                <Link href="/login" className="font-bold underline">Log in</Link> or{' '}
                <Link href="/signup" className="font-bold underline">sign up</Link> to manage your portfolio items.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {!isReadOnly && (!items || items.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <h3 className="text-xl font-bold">No portfolio items yet</h3>
            <p className="mt-2 text-muted-foreground">
              Add your first item manually or import from GitHub or a URL.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <AddPortfolioItemDialog canAdd={canAdd} nextIndex={0}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add manually
                </Button>
              </AddPortfolioItemDialog>
              <Button asChild variant="outline">
                <Link href="/import-data">Import from GitHub / URL</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items?.map((item) => (
            <ProjectCard key={item.id} project={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
