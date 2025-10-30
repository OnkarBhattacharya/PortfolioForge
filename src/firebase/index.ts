'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  // Ensure all required Firebase config values are present before initializing
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId
  ) {
    // In development, this is a fatal error.
    if (process.env.NODE_ENV === 'development') {
        const missingKeys = Object.entries(firebaseConfig)
            .filter(([, value]) => !value)
            .map(([key]) => key.replace('NEXT_PUBLIC_', ''));
            
        let errorMessage = "Firebase configuration is missing. ";
        if (missingKeys.length > 0) {
            errorMessage += `Please add the following keys to your .env.local file: ${missingKeys.join(", ")}.`;
        } else {
            errorMessage += "Check your environment variables setup.";
        }
        
        throw new Error(errorMessage);
    }
  }

  const firebaseApp = initializeApp(firebaseConfig);
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
