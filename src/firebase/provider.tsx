
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { logger } from '@/lib/logger';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    // If no Auth service instance, cannot determine user state
    if (!auth || !firestore) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth or Firestore service not provided.") });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => { // Auth state determined
        if (firebaseUser) {
          // If the user is a permanent user (not anonymous), check for and create their profile.
          if (!firebaseUser.isAnonymous) {
            const userRef = doc(firestore, "users", firebaseUser.uid);
            try {
              const docSnap = await getDoc(userRef);
              if (!docSnap.exists()) {
                const newUserProfile = {
                  id: firebaseUser.uid, // Add the ID to satisfy security rules
                  email: firebaseUser.email,
                  fullName: firebaseUser.displayName,
                  role: 'user', // Assign a default role
                  subscriptionTier: 'free',
                  subscriptionStatus: 'active',
                  themeId: 'freelancer-teal',
                  createdAt: new Date().toISOString(),
                };

                // Create a new user profile if it doesn't exist
                setDoc(userRef, newUserProfile)
                  .catch((error) => {
                    logger.error("Error creating user profile:", { error });
                    const permissionError = new FirestorePermissionError({
                      path: userRef.path,
                      operation: 'create',
                      requestResourceData: newUserProfile,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                  });
              }
            } catch (error) {
                 logger.error("Error fetching user profile:", { error });
                 const permissionError = new FirestorePermissionError({
                    path: userRef.path,
                    operation: 'get',
                 });
                 errorEmitter.emit('permission-error', permissionError);
            }
          }
          // For any signed-in user (anonymous or permanent), update the state.
          setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
        } else if (auth) { // Ensure auth is available before trying to sign in
          // No user is signed in; initiate a new anonymous session.
          try {
            await signInAnonymously(auth);
            // onAuthStateChanged will fire again with the new anonymous user.
            // We don't set state here to avoid a flicker; isUserLoading remains true
            // until the new user state is confirmed by the next listener call.
          } catch (error) {
            logger.error("FirebaseProvider: Anonymous sign-in failed", { error });
            // If anonymous sign-in fails, we stop loading and record the error.
            const signInError = error instanceof Error ? error : new Error('Anonymous sign-in failed');
            setUserAuthState({ user: null, isUserLoading: false, userError: signInError });
          }
        }
      },
      (error) => { // Auth listener error
        logger.error("FirebaseProvider: onAuthStateChanged error:", { error });
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe(); // Cleanup
  }, [auth, firestore]); // Depends on the auth and firestore instances

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // This hook is a simple wrapper around useMemo to provide a consistent API for memoizing
  // Firebase-related objects, like query references. This helps prevent re-renders.
  return useMemo(factory, deps);
}
