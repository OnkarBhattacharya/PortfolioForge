'use client';

import React, { useMemo } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase/index';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
    const firebaseServices = useMemo(() => {
        // Ensure this only runs on the client
        if (typeof window !== 'undefined') {
            return initializeFirebase();
        }
        // Return null on the server to avoid trying to initialize Firebase
        return null;
    }, []);

    // During SSR or if Firebase is not yet initialized, you might want to show a loader
    // or just render children. Here we render children to avoid layout shifts.
    if (!firebaseServices || !firebaseServices.firebaseApp) {
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
