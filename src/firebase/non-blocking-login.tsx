
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';
import { doc, getDoc, Firestore, setDoc } from 'firebase/firestore';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';

/**
 * Creates a user profile document in Firestore if it doesn't already exist.
 * This function is called after a new user is created.
 * It uses a non-blocking write and emits a contextual error on permission failure.
 * @param firestore - The Firestore instance.
 * @param user - The user object from Firebase Authentication.
 * @param fullName - The user's full name (optional, for email sign-up).
 */
const createUserProfile = (firestore: Firestore, user: User, fullName?: string) => {
  const userRef = doc(firestore, 'users', user.uid);

  getDoc(userRef).then(userDoc => {
    // Only create a profile if one doesn't already exist
    if (!userDoc.exists()) {
      const profileData = {
        id: user.uid,
        email: user.email,
        fullName: fullName || user.displayName || 'New User',
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        themeId: 'default', // Set a default theme for new users
      };
      
      // Non-blocking write with contextual error handling
      setDoc(userRef, profileData)
        .catch(() => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: profileData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  });
};


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth) {
  signInAnonymously(authInstance).catch((error) => {
    // This is a non-critical error, so we just log it.
    console.error("Anonymous sign-in failed:", error);
  });
}

/** Initiate email/password sign-up (blocking to allow for profile creation). */
export async function initiateEmailSignUp(authInstance: Auth, firestore: Firestore, email: string, password: string, fullName: string) {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    // The profile creation is now a non-blocking fire-and-forget operation from the UI's perspective
    createUserProfile(firestore, userCredential.user, fullName);
    return userCredential;
}

/** Initiate email/password sign-in (blocking). */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string) {
    return await signInWithEmailAndPassword(authInstance, email, password);
}
