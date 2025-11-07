'use client';

import { firebaseConfig } from '@/firebase/config';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

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
    throw new Error('Firebase can only be initialized on the client side.');
  }

  // If already initialized, return the existing services.
  if (firebaseServices) {
    return firebaseServices;
  }

  if (getApps().length === 0) {
    // Validate the Firebase config to prevent runtime errors.
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
    // If the app is already initialized by another script, get the existing instance.
    const app = getApp();
    firebaseServices = {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
  }
  
  return firebaseServices;
}


// Export Providers and hooks
export { FirebaseClientProvider } from './client-provider';
export {
  FirebaseProvider,
  useFirebase,
  useAuth,
  useFirestore,
  useFirebaseApp,
  useMemoFirebase,
  useUser,
} from './provider';

// Export Firestore hooks
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';