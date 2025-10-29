
'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';

/**
 * Interface for the return value of the useUser hook.
 */
export interface UseUserResult {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * React hook to get the current authenticated user from Firebase.
 *
 * @param {Auth} auth - The Firebase Auth instance.
 * @returns {UseUserResult} - An object containing the user, loading state, and error.
 */
export const useUser = (auth: Auth): UseUserResult => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Set initial state
    setIsLoading(true);
    setError(null);

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setIsLoading(false);
      },
      (error) => {
        console.error("useUser hook error:", error);
        setError(error);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Rerun effect if auth instance changes

  return { user, isLoading, error };
};
