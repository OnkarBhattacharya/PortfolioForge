
'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore } from '../../firebase';
import { doc } from 'firebase/firestore';
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
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || user.isAnonymous || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

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
          <Link href="/" className="text-primary underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
