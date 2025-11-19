
'use client';

import React, { useMemo } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase/index';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
    const firebaseServices = useMemo(() => {
        if (typeof window !== 'undefined') {
            return initializeFirebase();
        }
        return { firebaseApp: null, auth: null, firestore: null };
    }, []);

    // During SSR or if services are not ready, render children without the provider.
    // The hooks will handle the loading state gracefully.
    if (!firebaseServices.firebaseApp) {
        return <>{children}</>;
    }

    return (
        <FirebaseProvider
            firebaseApp={firebaseServices.firebaseApp}
            auth={firebaseServices.auth!}
            firestore={firebaseServices.firestore!}
        >
            {children}
        </FirebaseProvider>
    );
}
