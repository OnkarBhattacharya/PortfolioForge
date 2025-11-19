
'use client';

import React, { useMemo } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase/index';
import { MainLayout } from '@/components/main-layout';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
    const firebaseServices = useMemo(() => {
        // Ensure this only runs on the client
        if (typeof window !== 'undefined') {
            return initializeFirebase();
        }
        // Return null on the server to avoid trying to initialize Firebase
        return null;
    }, []);

    // During SSR or if Firebase is not yet initialized on the client,
    // you might want to show a loading state or a skeleton layout.
    // For simplicity, we render the MainLayout but the Firebase context will be unavailable.
    if (!firebaseServices) {
        return (
            <MainLayout>
                {children}
            </MainLayout>
        );
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
