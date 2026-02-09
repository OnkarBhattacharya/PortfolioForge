'use client';

import React from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from './ui/toaster';
import CookieBanner from './cookie-banner';
import { AppChrome } from './app-chrome';

/**
 * The main client-side provider boundary. It sets up all necessary
 * client-side contexts for the application.
 */
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            <AppChrome>{children}</AppChrome>
            <Toaster />
            <CookieBanner />
        </FirebaseClientProvider>
    );
}
