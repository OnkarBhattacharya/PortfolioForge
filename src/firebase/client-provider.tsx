'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase/index';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Initialize Firebase services. useMemo ensures this is done only once per render.
  // The initializeFirebase function itself is idempotent, so it's safe to call.
  const firebaseServices = useMemo(() => initializeFirebase(), []);

  if (!firebaseServices) {
    // This can happen on the server, where we don't want to initialize Firebase.
    // Render children so that Server Components can still render.
    // The client-side will then handle the full Firebase context.
    return <>{children}</>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
