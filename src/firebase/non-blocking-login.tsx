
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  User,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

// Create stable, singleton instances of the providers
const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');
const appleProvider = new OAuthProvider('apple.com');

/**
 * Creates a user profile document in Firestore if it doesn't already exist.
 * This function is called after a new user is created.
 * @param firestore - The Firestore instance.
 * @param user - The user object from Firebase Authentication.
 * @param fullName - The user's full name (optional, for email sign-up).
 */
const createUserProfile = async (firestore: Firestore, user: User, fullName?: string) => {
  const userRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userRef);

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
    await setDoc(userRef, profileData);
  }
};


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth) {
  signInAnonymously(authInstance).catch((error) => {
    console.error("Anonymous sign-in failed:", error);
    // This is a non-critical error, so we just log it.
  });
}

/** Initiate email/password sign-up (blocking to allow for profile creation). */
export async function initiateEmailSignUp(authInstance: Auth, firestore: Firestore, email: string, password: string, fullName: string) {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    await createUserProfile(firestore, userCredential.user, fullName);
    return userCredential;
}

/** Initiate email/password sign-in (blocking). */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string) {
    return await signInWithEmailAndPassword(authInstance, email, password);
}
