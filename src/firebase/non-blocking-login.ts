
'use client';

import { Auth, signInAnonymously } from 'firebase/auth';

/**
 * Initiates an anonymous sign-in process in the background without blocking
 * the main thread. This is useful for creating a seamless "guest" session
 * for new users.
 *
 * @param auth The Firebase Auth instance.
 */
export const initiateAnonymousSignIn = (auth: Auth) => {
  signInAnonymously(auth).catch((error) => {
    // In a real-world app, you might want to log this to a service like Sentry.
    // For now, we'll log it to the console as it's not a user-facing error.
    console.error('Non-blocking anonymous sign-in failed:', error);
  });
};
