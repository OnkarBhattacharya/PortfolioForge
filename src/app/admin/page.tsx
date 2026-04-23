'use client';

import { useEffect, useState } from 'react';
import { collection, doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '../../firebase';

type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  subscriptionTier?: 'free' | 'pro';
  role?: 'user' | 'admin';
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || user.isAnonymous || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  const isAdmin = userProfile?.role === 'admin';

  const usersQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return collection(firestore, 'users');
  }, [firestore, isAdmin]);

  const { data: users, isLoading: isUsersLoading } = useCollection<UserProfile>(usersQuery);

  useEffect(() => {
    if (!isMounted || isUserLoading || isProfileLoading) {
      return;
    }

    if (!user || user.isAnonymous || !isAdmin) {
      router.replace('/dashboard');
      router.refresh();
    }
  }, [isMounted, isUserLoading, isProfileLoading, user, isAdmin, router]);

  if (!isMounted || isUserLoading || isProfileLoading) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-2 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <CardTitle className="font-headline">Loading admin access</CardTitle>
            <CardDescription>
              Verifying your account before showing the admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!user || user.isAnonymous || !isAdmin) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-2 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <CardTitle className="font-headline">Redirecting</CardTitle>
            <CardDescription>
              You do not have access to this page. Taking you back to the dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          Admin Dashboard
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">User Management</CardTitle>
          <CardDescription>
            A list of all users in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUsersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.subscriptionTier === 'pro' ? 'default' : 'secondary'}>
                        {user.subscriptionTier || 'free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                        {user.role || 'user'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}