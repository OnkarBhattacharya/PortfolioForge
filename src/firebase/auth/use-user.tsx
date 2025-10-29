
'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';


export interface UseUserResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}


export const useUser = (): UseUserResult => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsLoading] = useState(true);
  const [userError, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth) {
        setIsLoading(false);
        return;
    };
    
    setIsLoading(true);
    setError(null);

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

    return () => unsubscribe();
  }, [auth]);

  return { user, isUserLoading, userError };
};
