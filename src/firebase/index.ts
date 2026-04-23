
'use client';

import { firebaseConfig } from '@/firebase/config';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, User } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { useContext } from 'react';
import { FirebaseContext, FirebaseServicesAndUser } from './provider';
import { getPerformance, Performance, initializePerformance } from 'firebase/performance';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// A structure to hold the initialized Firebase services.
interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  performance: Performance;
}

let firebaseServices: FirebaseServices | null = null;

/**
 * Initializes Firebase on the client-side and returns the SDK instances.
 * It ensures that initialization only happens once.
 *
 * @returns An object containing the initialized FirebaseApp, Auth, and Firestore instances.
 */
export function initializeFirebase(): FirebaseServices {
  if (typeof window === 'undefined') {
    // @ts-ignore
    return null;
  }

  if (firebaseServices) {
    return firebaseServices;
  }

  if (getApps().length === 0) {
    if (
      !firebaseConfig.apiKey ||
      !firebaseConfig.authDomain ||
      !firebaseConfig.projectId
    ) {
      throw new Error(
        'Firebase configuration is missing or incomplete. Please check your environment variables.'
      );
    }
    const app = initializeApp(firebaseConfig);

    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true
      });
    }

    firebaseServices = {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      performance: initializePerformance(app, { dataCollectionEnabled: false, instrumentationEnabled: false }),
    };
  } else {
    const app = getApp();
    firebaseServices = {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      performance: initializePerformance(app, { dataCollectionEnabled: false, instrumentationEnabled: false }),
    };
  }
  
  return firebaseServices;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Export Providers and hooks
export { FirebaseClientProvider } from './client-provider';
export {
  FirebaseProvider,
  useMemoFirebase,
} from './provider';

// Export Firestore hooks
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';


/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined || !context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/** Hook to access Firebase Auth instance. Returns null when not in a provider (SSR). */
export const useAuth = (): Auth | null => {
  const context = useContext(FirebaseContext);
  return context?.auth ?? null;
};

/** Hook to access Firestore instance. Returns null when not in a provider (SSR). */
export const useFirestore = (): Firestore | null => {
  const context = useContext(FirebaseContext);
  return context?.firestore ?? null;
};

/** Hook to access Firebase App instance. Returns null when not in a provider (SSR). */
export const useFirebaseApp = (): FirebaseApp | null => {
  const context = useContext(FirebaseContext);
  return context?.firebaseApp ?? null;
};

/**
 * Hook specifically for accessing the authenticated user's state.
 * Returns a safe loading state when used outside a FirebaseProvider (SSR).
 */
export const useUser = (): UserHookResult => {
  const context = useContext(FirebaseContext);
  if (!context) {
    return { user: null, isUserLoading: true, userError: null };
  }
  return {
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};
