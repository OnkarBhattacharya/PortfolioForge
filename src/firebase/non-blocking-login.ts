
'use client';

import { Auth, signInAnonymously } from 'firebase/auth';
import { logger } from '@/lib/logger';

/**
 * Initiates an anonymous sign-in process in the background without blocking
 * the main thread. This is useful for creating a seamless "guest" session
 * for new users.
 *
 * @param auth The Firebase Auth instance.
 */
export const initiateAnonymousSignIn = (auth: Auth) => {
  signInAnonymously(auth).catch((error) => {
    logger.error('Non-blocking anonymous sign-in failed', { error });
  });
};
