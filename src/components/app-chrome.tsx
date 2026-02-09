'use client';

import { usePathname } from 'next/navigation';
import { MainLayout } from './main-layout';

const shellExceptions = [
  '/',
  '/pricing',
  '/login',
  '/signup',
  '/privacy-policy',
  '/terms-and-conditions',
  '/cookie-policy',
];

const isShellExcluded = (pathname: string) => {
  if (shellExceptions.includes(pathname)) return true;
  if (pathname.startsWith('/portfolio/')) return true;
  return false;
};

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isShellExcluded(pathname)) {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
