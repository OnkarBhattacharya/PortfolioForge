'use client';

import React from 'react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser, useSupabase } from '@/hooks/use-supabase';
import { CreditCard, Loader2, LogOut, User, LogIn, Settings, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LanguageSwitcher } from './language-switcher';

type UserProfile = {
  role?: 'user' | 'admin';
};

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const supabase = useSupabase();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Fetch user profile
  React.useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setIsProfileLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (!error && data) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, supabase]);

  const handleLogout = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await supabase.auth.signOut();
      router.replace('/');
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isUserLoading) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <Button asChild variant="ghost">
          <Link href="/login">
            <LogIn className="mr-2" /> Login
          </Link>
        </Button>
      </div>
    );
  }

  if (isProfileLoading) {
    return (
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" disabled>
          <Avatar className="h-9 w-9">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <LanguageSwitcher />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={user.user_metadata?.avatar_url || `https://picsum.photos/seed/${user.id}/100/100`}
                alt={user.user_metadata?.full_name || 'User'}
              />
              <AvatarFallback>
                {user.user_metadata?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            {userProfile?.role === 'admin' && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} disabled={isSigningOut}>
            {isSigningOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            <span>{isSigningOut ? 'Logging out...' : 'Log out'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}