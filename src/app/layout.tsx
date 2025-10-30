
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { MainLayout } from '@/components/main-layout';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import CookieBanner from '@/components/cookie-banner';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'PortfolioForge',
  description: 'Forge your professional software engineering portfolio.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased flex flex-col min-h-screen')}>
        <FirebaseClientProvider>
          <div className="flex-1">
            <MainLayout>{children}</MainLayout>
          </div>
          <Footer />
          <Toaster />
          <CookieBanner />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
