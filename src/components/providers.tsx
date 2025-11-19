'use client';

import React from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from './ui/toaster';
import CookieBanner from './cookie-banner';
import { MainLayout } from './main-layout';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            <MainLayout>
                {children}
            </MainLayout>
            <Toaster />
            <CookieBanner />
        </FirebaseClientProvider>
    );
}
