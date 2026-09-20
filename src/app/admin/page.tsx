'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useUser, useSupabase } from '@/hooks/use-supabase';

type UserProfile = {
  id: string;
  full_name?: string;
  email?: string;
  subscription_tier?: 'free' | 'pro' | 'studio';
  role?: 'user' | 'admin';
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const supabase = useSupabase();
  const [isMounted, setIsMounted] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch current user profile
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
  }, [user, supabase]);

  const isAdmin = userProfile?.role === 'admin';

  // Fetch all users if admin
  React.useEffect(() => {
    if (!isAdmin) {
      setUsers([]);
      setIsUsersLoading(false);
      return;
    }

    setIsUsersLoading(true);
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, subscription_tier, role');
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsUsersLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin, supabase]);

  React.useEffect(() => {
    if (!isMounted || isUserLoading || isProfileLoading) {
      return;
    }

    if (!user || !isAdmin) {
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

  if (!user || !isAdmin) {
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
                    <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.subscription_tier === 'pro' || user.subscription_tier === 'studio' ? 'default' : 'secondary'}>
                        {user.subscription_tier || 'free'}
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