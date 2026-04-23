'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, OAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const getAuthErrorMessage = (error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed before completing authentication.';
    case 'auth/cancelled-popup-request':
      return 'The sign-in request was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Please allow popups and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    default:
      return error instanceof Error && error.message ? error.message : 'Unable to sign up right now. Please try again.';
  }
};

export default function SignupPage() {
  const auth = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async (provider: GoogleAuthProvider | OAuthProvider, providerName: string) => {
    if (!auth || isLoading) {
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      await signInWithPopup(auth, provider);
      router.replace('/dashboard');
      router.refresh();
    } catch (error) {
      logger.error(`Error signing in with ${providerName}`, { error });
      setAuthError(getAuthErrorMessage(error));
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
            onClick={() => handleSignIn(new GoogleAuthProvider(), 'Google')}
            className="flex w-full items-center justify-center"
            variant="outline"
            disabled={!canSignIn}
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FcGoogle className="mr-2 h-5 w-5" />}
            Continue with Google
          </Button>
          <Button
            onClick={() => handleSignIn(new OAuthProvider('apple.com'), 'Apple')}
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