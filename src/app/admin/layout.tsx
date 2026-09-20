'use client';

import React from 'react';
import { useUser, useSupabase } from '@/hooks/use-supabase';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

type UserProfile = {
  role?: 'user' | 'admin';
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const supabase = useSupabase();

  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setIsProfileLoading(false);
      return;
    }

    setIsProfileLoading(true);
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
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
  }, [user, supabase]);

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (userProfile?.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldAlert className="h-16 w-16 text-destructive" />
          <h1 className="font-headline text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have permission to view this page.
          </p>
          <Link href="/dashboard" className="text-primary underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}