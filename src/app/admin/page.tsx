
'use client';

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
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  subscriptionTier?: 'free' | 'pro';
  role?: 'user' | 'admin';
};

export default function AdminDashboardPage() {
  const { firestore } = useFirebase();

  const usersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

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
          {isLoading ? (
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
