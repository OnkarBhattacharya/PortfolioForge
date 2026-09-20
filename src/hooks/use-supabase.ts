'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';

export interface ExtendedUser extends User {
  isAnonymous: boolean;
  uid: string;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
}

export interface UserHookResult {
  user: ExtendedUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseClient;
}

function extendUser(user: User | null): ExtendedUser | null {
  if (!user) return null;
  return {
    ...user,
    isAnonymous: false,
    uid: user.id,
    getIdToken: async (forceRefresh = false) => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');
      return session.access_token;
    },
  };
}

export function useUser(): UserHookResult {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(extendUser(session?.user ?? null));
        setIsUserLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(extendUser(session?.user ?? null));
      setIsUserLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isUserLoading, userError };
}

export function useAuth() {
  const supabase = getSupabase();
  return supabase.auth;
}

export function useSupabase() {
  return getSupabase();
}