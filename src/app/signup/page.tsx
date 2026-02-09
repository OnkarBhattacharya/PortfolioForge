'use client';

import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, OAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import Link from 'next/link';

export default function SignupPage() {
  const { auth } = useFirebase();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      logger.error('Error signing in with Google', { error });
    }
  };

  const handleAppleSignIn = async () => {
    const provider = new OAuthProvider('apple.com');
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      logger.error('Error signing in with Apple', { error });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Start free. Upgrade when you&apos;re ready to publish like a pro.
          </p>
        </div>
        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center"
            variant="outline"
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
          <Button
            onClick={handleAppleSignIn}
            className="flex w-full items-center justify-center"
            variant="outline"
          >
            <FaApple className="mr-2 h-5 w-5" />
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
