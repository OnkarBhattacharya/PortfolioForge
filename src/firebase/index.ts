'use client';

import { firebaseConfig } from '@/firebase/config';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, User } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { useContext } from 'react';
import { FirebaseContext, FirebaseServicesAndUser } from './provider';

// A structure to hold the initialized Firebase services.
interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
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
    firebaseServices = {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
  } else {
    const app = getApp();
    firebaseServices = {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
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

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    // This case might happen during SSR, so we throw a more specific error.
    // The component using this hook should handle the loading state until Firebase is ready.
    throw new Error('Firebase core services not available. Ensure FirebaseClientProvider is set up correctly.');
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

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
