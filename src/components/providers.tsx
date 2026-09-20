'use client';

import React from 'react';
import { Toaster } from './ui/toaster';
import CookieBanner from './cookie-banner';
import { AppChrome } from './app-chrome';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
      <>
        <AppChrome>{children}</AppChrome>
        <Toaster />
        <CookieBanner />
      </>
    );
}