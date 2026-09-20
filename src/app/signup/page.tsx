'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { useAuth } from '@/hooks/use-supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const auth = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async (provider: 'google' | 'apple') => {
    if (!auth || isLoading) {
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      router.replace('/dashboard');
      router.refresh();
    } catch (error) {
      console.error(`Error signing in with ${provider}`, { error });
      setAuthError(error instanceof Error ? error.message : `Unable to sign up with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const canSignIn = !!auth && !isLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-md">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-bold">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start free. Upgrade when you're ready to publish like a pro.
          </p>
        </div>

        {authError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
            {authError}
          </p>
        )}

        {!auth && (
          <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Authentication is still loading. Please wait a moment and try again.
          </p>
        )}

        <div className="space-y-4">
          <Button
            onClick={() => handleSignIn('google')}
            className="flex w-full items-center justify-center"
            variant="outline"
            disabled={!canSignIn}
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FcGoogle className="mr-2 h-5 w-5" />}
            Continue with Google
          </Button>
          <Button
            onClick={() => handleSignIn('apple')}
            className="flex w-full items-center justify-center"
            variant="outline"
            disabled={!canSignIn}
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FaApple className="mr-2 h-5 w-5" />}
            Continue with Apple
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}