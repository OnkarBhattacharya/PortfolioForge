
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'portfolioforge_cookie_consent';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== 'true') {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="container mx-auto px-4 py-3 sm:flex sm:items-center sm:justify-between">
        <p className="text-sm text-foreground mb-2 sm:mb-0">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
          <Link href="/cookie-policy" className="font-bold underline ml-2">
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
