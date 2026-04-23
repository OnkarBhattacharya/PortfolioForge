'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'portfolioforge_cookie_consent';

export default function CookieBanner() {
  const [isMounted, setIsMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const syncConsent = () => {
      const consent = window.localStorage.getItem(COOKIE_CONSENT_KEY);
      setShowBanner(consent !== 'true');
    };

    syncConsent();
    window.addEventListener('storage', syncConsent);

    return () => {
      window.removeEventListener('storage', syncConsent);
    };
  }, []);

  const handleAccept = () => {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setShowBanner(false);
  };

  if (!isMounted || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background shadow-lg">
      <div className="container mx-auto px-4 py-3 sm:flex sm:items-center sm:justify-between">
        <p className="mb-2 text-sm text-foreground sm:mb-0">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
          <Link href="/cookie-policy" className="ml-2 font-bold underline">
            Learn more
          </Link>
        </p>
        <Button onClick={handleAccept} size="sm">
          Accept
        </Button>
      </div>
    </div>
  );
}