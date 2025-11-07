'use client';

import { firebaseConfig } from '@/firebase/config';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getRemoteConfig } from 'firebase/remote-config';

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

      let errorMessage = 'Firebase configuration is missing. ';
      if (missingKeys.length > 0) {
        errorMessage += `Please add the following keys to your .env.local file: ${missingKeys.join(
          ', '
        )}.`;
      } else {
        errorMessage += 'Check your environment variables setup.';
      }

      throw new Error(errorMessage);
    }
  }

  const firebaseApp = initializeApp(firebaseConfig);
  return getSdks(firebaseApp);
}

function getSdks(app: FirebaseApp) {
  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
    remoteConfig: getRemoteConfig(app),
  };
}
