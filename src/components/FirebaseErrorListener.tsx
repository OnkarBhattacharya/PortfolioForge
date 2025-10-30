'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * In development, it throws any received error to be caught by Next.js's global-error.tsx.
 * In production, it logs the error to the console without throwing.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      if (process.env.NODE_ENV === 'development') {
        // In development, throw the error to leverage the Next.js error overlay
        setError(error);
      } else {
        // In production, just log the error without breaking the UI
        console.error('Firestore Permission Error:', error.message);
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // Only throw the error in development
  if (error && process.env.NODE_ENV === 'development') {
    throw error;
  }

  // This component renders nothing.
  return null;
}
