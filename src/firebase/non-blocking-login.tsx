
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

// Create a single, stable instance for each provider
const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');
const appleProvider = new OAuthProvider('apple.com');


export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(error => {
    console.error("Anonymous sign-in failed:", error);
    // In a real app, you might want to handle this more gracefully
  });
}

export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  try {
    return await createUserWithEmailAndPassword(authInstance, email, password);
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

export async function initiateSignOut(authInstance: Auth): Promise<void> {
    try {
        await signOut(authInstance);
    } catch (error) {
        console.error("Sign-out failed:", error);
        throw error;
    }
}

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
