
'use client';

import React, { useMemo } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase/index';
import { MainLayout } from '@/components/main-layout';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/**
 * This is the primary client-side boundary for Firebase.
 * It ensures that Firebase is initialized only once on the client and
 * provides the necessary context to all children, including the MainLayout.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
    // Memoize Firebase initialization to ensure it runs only once.
    const firebaseServices = useMemo(() => {
        if (typeof window !== 'undefined') {
            return initializeFirebase();
        }
        // On the server, we return null. The provider will handle this gracefully.
        return null;
    }, []);

    // During SSR or before Firebase is initialized, we render nothing.
    // The browser will wait for the client-side render to show the UI.
    // This prevents any component from trying to access Firebase context prematurely.
    if (!firebaseServices) {
        return null; 
    }

    return (
        <FirebaseProvider
            firebaseApp={firebaseServices.firebaseApp}
            auth={firebaseServices.auth}
            firestore={firebaseServices.firestore}
        >
            <MainLayout>
                {children}
            </MainLayout>
            <FirebaseErrorListener />
        </FirebaseProvider>
    );
}
