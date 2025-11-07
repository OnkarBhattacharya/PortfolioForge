
'use client';

import { FirebaseClientProvider } from "@/firebase/client-provider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            {children}
        </FirebaseClientProvider>
    );
}
