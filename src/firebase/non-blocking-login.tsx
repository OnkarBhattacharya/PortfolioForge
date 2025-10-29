
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

// Create a single, stable instance for each provider
const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');
const appleProvider = new OAuthProvider('apple.com');


// Helper to create a user profile document
const createUserProfile = async (firestore: Firestore, user: UserCredential['user'], fullName?: string) => {
    if (!firestore) throw new Error("Firestore not available");
    const userRef = doc(firestore, 'users', user.uid);

    // Check if the document already exists before creating it
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
        await setDoc(userRef, {
            id: user.uid,
            email: user.email,
            fullName: fullName || user.displayName || 'New User',
            themeId: 'default',
        });
    }
};

export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(error => {
    console.error("Anonymous sign-in failed:", error);
    // In a real app, you might want to handle this more gracefully
  });
}

// --- EMAIL AUTH ---
export async function initiateEmailSignUp(authInstance: Auth, firestore: Firestore, email: string, password: string, fullName: string): Promise<UserCredential> {
  try {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    await createUserProfile(firestore, userCredential.user, fullName);
    return userCredential;
  } catch (error) {
     console.error("Sign-up failed:", error);
     throw error;
  }
}

export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(authInstance, email, password);
  } catch (error) {
      console.error("Sign-in failed:", error);
      throw error;
  }
}

// --- SOCIAL AUTH ---

async function handleSocialAuth(authInstance: Auth, firestore: Firestore, provider: GoogleAuthProvider | OAuthProvider): Promise<UserCredential> {
    try {
        const userCredential = await signInWithPopup(authInstance, provider);
        // This is a sign-up, so create the profile
        await createUserProfile(firestore, userCredential.user);
        return userCredential;
    } catch (error) {
        console.error("Social sign-up failed:", error);
        throw error;
    }
}

export const initiateGoogleSignUp = (auth: Auth, firestore: Firestore) => handleSocialAuth(auth, firestore, googleProvider);
export const initiateMicrosoftSignUp = (auth: Auth, firestore: Firestore) => handleSocialAuth(auth, firestore, microsoftProvider);
export const initiateAppleSignUp = (auth: Auth, firestore: Firestore) => handleSocialAuth(auth, firestore, appleProvider);


export async function initiateGoogleSignIn(authInstance: Auth): Promise<UserCredential> {
    try {
        return await signInWithPopup(authInstance, googleProvider);
    } catch (error) {
        console.error("Google sign-in failed:", error);
        throw error;
    }
}

export async function initiateMicrosoftSignIn(authInstance: Auth): Promise<UserCredential> {
    try {
        return await signInWithPopup(authInstance, microsoftProvider);
    } catch (error) {
        console.error("Microsoft sign-in failed:", error);
        throw error;
    }
}

export async function initiateAppleSignIn(authInstance: Auth): Promise<UserCredential> {
    try {
        return await signInWithPopup(authInstance, appleProvider);
    } catch (error) {
        console.error("Apple sign-in failed:", error);
        throw error;
    }
}


// --- SIGN OUT ---
export async function initiateSignOut(authInstance: Auth): Promise<void> {
    try {
        await signOut(authInstance);
    } catch (error) {
        console.error("Sign-out failed:", error);
        throw error;
    }
}

    