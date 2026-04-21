
'use client';

import React, { useEffect, useState } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase/index';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseServices {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
}

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
    const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);

    useEffect(() => {
        // Initialize Firebase only on the client, after first render.
        // useEffect never runs on the server, so SSR output matches initial client render.
        const services = initializeFirebase();
        if (services) {
            setFirebaseServices(services);
        }
    }, []);

    if (!firebaseServices) {
        // Render children without Firebase context on first render (matches SSR output).
        return <>{children}</>;
    }

    return (
        <FirebaseProvider
            firebaseApp={firebaseServices.firebaseApp}
            auth={firebaseServices.auth}
            firestore={firebaseServices.firestore}
        >
            {children}
            <FirebaseErrorListener />
        </FirebaseProvider>
    );
}
