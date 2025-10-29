
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { errorEmitter } from './error-emitter';

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
