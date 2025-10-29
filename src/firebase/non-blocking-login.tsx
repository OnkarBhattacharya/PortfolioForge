
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
} from 'firebase/auth';
import { errorEmitter } from './error-emitter';

// Create a single, stable instance for each provider
const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');
const appleProvider = new OAuthProvider('apple.com');


export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(error => {
    console.error("Anonymous sign-in failed:", error);
  });
}

export function initiateEmailSignUp(authInstance: Auth, email: string, password: string) {
  return createUserWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
       console.error("Sign-up failed:", error);
       throw error;
    });
}

export function initiateEmailSignIn(authInstance: Auth, email: string, password: string) {
  return signInWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
        console.error("Sign-in failed:", error);
        throw error;
    });
}

export function initiateSignOut(authInstance: Auth) {
    return signOut(authInstance)
     .catch(error => {
        console.error("Sign-out failed:", error);
        throw error;
    });
}

export function initiateGoogleSignIn(authInstance: Auth) {
    return signInWithPopup(authInstance, googleProvider)
        .catch(error => {
            console.error("Google sign-in failed:", error);
            throw error;
        });
}

export function initiateMicrosoftSignIn(authInstance: Auth) {
    return signInWithPopup(authInstance, microsoftProvider)
        .catch(error => {
            console.error("Microsoft sign-in failed:", error);
            throw error;
        });
}

export function initiateAppleSignIn(authInstance: Auth) {
    return signInWithPopup(authInstance, appleProvider)
        .catch(error => {
            console.error("Apple sign-in failed:", error);
            throw error;
        });
}
