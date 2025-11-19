'use client';

import React from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from './ui/toaster';
import CookieBanner from './cookie-banner';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            {children}
            <Toaster />
            <CookieBanner />
        </FirebaseClientProvider>
    );
}
