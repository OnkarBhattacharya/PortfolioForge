'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { PortfolioItem } from '@/types';

// Supabase client singleton
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

// Replacement for Firebase's useUser hook
export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setIsUserLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsUserLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isUserLoading, userError };
}

// Supabase replacement for useAuth
export function useAuth() {
  const supabase = getSupabase();
  return supabase.auth;
}

// Supabase replacement for useFirestore
export function useFirestore() {
  return getSupabase();
}

// Supabase replacement for useDoc
export function useDoc<T>(query: Promise<{ data: T | null; error: any }> | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    query.then(({ data, error }) => {
      if (error) {
        setError(error);
        setData(null);
      } else {
        setData(data);
        setError(null);
      }
      setIsLoading(false);
    });
  }, [query]);

  return { data, isLoading, error };
}

// Supabase replacement for useCollection
export function useCollection<T>(query: Promise<{ data: T[] | null; error: any }> | null) {
  const [data, setData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    query.then(({ data, error }) => {
      if (error) {
        setError(error);
        setData(null);
      } else {
        setData(data);
        setError(null);
      }
      setIsLoading(false);
    });
  }, [query]);

  return { data, isLoading, error };
}

// Supabase replacement for useMemoFirebase
export function useMemoFirebase<T>(factory: () => Promise<any> | any, deps: any[]) {
  const [instance, setInstance] = useState<Promise<any> | any>(null);

  useEffect(() => {
    const result = factory();
    if (result instanceof Promise) {
      result.then(setInstance);
    } else {
      setInstance(result);
    }
  }, deps);

  return instance;
}

// Re-export the Supabase client creation for advanced usage
export { createBrowserClient } from '@supabase/ssr';