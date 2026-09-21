'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { useAuth } from '@/hooks/use-supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail } from 'lucide-react';

type OAuthProvider = 'google' | 'github';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || searchParams.get('next') || '/dashboard';
  const urlError = searchParams.get('error');

  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(
    urlError === 'auth_failed' ? 'Sign-in failed. Please check your provider config and try again.' : null
  );
  const [info, setInfo] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // IMPORTANT: do NOT call router.replace() after signInWithOAuth.
  // Supabase redirects the browser to the provider (Google/GitHub).
  // Navigating away here cancels that redirect — that's why "nothing happens".
  const handleOAuth = async (provider: OAuthProvider) => {
    if (!auth || oauthLoading) return;
    setOauthLoading(provider);
    setAuthError(null);
    setInfo(null);
    try {
      const { error } = await auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      });
      if (error) throw error;
      // Browser is now navigating to the provider. Do nothing else.
    } catch (error) {
      console.error(`Error signing in with ${provider}`, { error });
      setAuthError(error instanceof Error ? error.message : `Unable to sign in with ${provider}. Please try again.`);
      setOauthLoading(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || emailLoading) return;
    setEmailLoading(true);
    setAuthError(null);
    setInfo(null);
    try {
      const { error } = await auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace(redirect);
      router.refresh();
    } catch (error) {
      console.error('Error signing in with email', { error });
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in with email. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!auth || magicLoading || !email) return;
    setMagicLoading(true);
    setAuthError(null);
    setInfo(null);
    try {
      const { error } = await auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}` },
      });
      if (error) throw error;
      setInfo('Check your email for a magic sign-in link.');
    } catch (error) {
      console.error('Error sending magic link', { error });
      setAuthError(error instanceof Error ? error.message : 'Unable to send magic link. Please try again.');
    } finally {
      setMagicLoading(false);
    }
  };

  const busy = oauthLoading !== null || emailLoading || magicLoading;
  const canAct = !!auth && !busy;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-md">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-bold">Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground">Choose your preferred sign-in method</p>
        </div>

        {authError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
            {authError}
          </p>
        )}
        {info && (
          <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground" role="status">
            {info}
          </p>
        )}

        {!auth && (
          <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Authentication is still loading. If this persists, NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are missing.
          </p>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => handleOAuth('google')}
            className="flex w-full items-center justify-center"
            variant="outline"
            disabled={!canAct}
          >
            {oauthLoading === 'google' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FcGoogle className="mr-2 h-5 w-5" />}
            Sign in with Google
          </Button>
          <Button
            onClick={() => handleOAuth('github')}
            className="flex w-full items-center justify-center"
            variant="outline"
            disabled={!canAct}
          >
            {oauthLoading === 'github' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FaGithub className="mr-2 h-5 w-5" />}
            Sign in with GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or with email</span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full" disabled={!canAct || !email || !password}>
            {emailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign in with Email
          </Button>
        </form>

        <Button variant="ghost" className="w-full" onClick={handleMagicLink} disabled={!canAct || !email}>
          {magicLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
          Email me a magic link instead
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New here?{' '}
          <Link href="/signup" className="font-semibold text-primary underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
