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

    // During SSR or if Firebase is not yet initialized, render the layout
    // without the provider. The children (the page) will be in a loading state.
    if (!firebaseServices || !firebaseServices.firebaseApp) {
        return <MainLayout>{children}</MainLayout>;
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
