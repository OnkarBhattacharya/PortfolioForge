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
import { useUser, useSupabase } from '@/hooks/use-supabase';
import { ArrowUpRight, KeyRound, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import AddPortfolioItemDialog from './add-project-dialog';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import type { PortfolioItem } from '@/types';

const ProjectCard = ({
  project,
  onDelete,
}: {
  project: PortfolioItem;
  onDelete: (id: string) => void;
}) => {
  const image = getPlaceholderImage(project.image_url ?? undefined);
  return (
    <Card className="flex h-full flex-col">
      {project.image_url && (
        <Image
          src={project.image_url}
          alt={project.title}
          width={600}
          height={400}
          className="aspect-video w-full rounded-t-lg object-cover"
        />
      )}
      <CardHeader>
        <CardTitle className="font-headline">{project.title}</CardTitle>
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
        {project.project_url ? (
          <Button asChild variant="secondary" className="flex-1">
            <Link href={project.project_url} target="_blank" rel="noopener noreferrer">
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
  const supabase = useSupabase();
  const { toast } = useToast();
  const isReadOnly = !user;
  const [isMounted, setIsMounted] = useState(false);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [areItemsLoading, setAreItemsLoading] = useState(true);

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, isReadOnly, supabase]);

  // Fetch portfolio items
  useEffect(() => {
    if (!user || isReadOnly) {
      setItems([]);
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
          .order('sort_order', { ascending: true });
        if (error) throw error;
        setItems(data || []);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setAreItemsLoading(false);
      }
    };

    fetchItems();
  }, [user, isReadOnly, supabase]);

  const handleDelete = async (itemId: string) => {
    if (isDeleting === itemId) return;

    setIsDeleting(itemId);
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user?.id);
      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast({ title: 'Item deleted', description: 'Portfolio item removed successfully.' });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({ variant: 'destructive', title: 'Delete failed', description: 'Could not delete the item.' });
    } finally {
      setIsDeleting(null);
    }
  };

  const isPro = userProfile?.subscription_tier === 'pro' || userProfile?.subscription_tier === 'studio';
  const maxFreeItems = 3;
  const itemCount = items?.length || 0;
  const canAdd = isPro || itemCount < maxFreeItems;

  if (!isMounted || isUserLoading || (!isReadOnly && (isProfileLoading || areItemsLoading))) {
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
              <AddPortfolioItemDialog canAdd={canAdd}>
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
            <ProjectCard
              key={item.id}
              project={item}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}