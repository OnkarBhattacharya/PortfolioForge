
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

const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');
const appleProvider = new OAuthProvider('apple.com');


// Helper to create a user profile document
const createUserProfile = async (firestore: Firestore, user: UserCredential['user'], fullName?: string) => {
    if (!firestore) throw new Error("Firestore not available");
    const userRef = doc(firestore, 'users', user.uid);

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
  });
}

// --- EMAIL AUTH ---
export async function initiateEmailSignUp(authInstance: Auth, firestore: Firestore, email: string, password: string, fullName: string): Promise<UserCredential> {
  const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
  await createUserProfile(firestore, userCredential.user, fullName);
  return userCredential;
}

export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}

// --- SOCIAL AUTH (SIGN UP) ---

async function handleSocialSignUp(authInstance: Auth, firestore: Firestore, provider: GoogleAuthProvider | OAuthProvider): Promise<UserCredential> {
    const userCredential = await signInWithPopup(authInstance, provider);
    await createUserProfile(firestore, userCredential.user);
    return userCredential;
}

export const initiateGoogleSignUp = (auth: Auth, firestore: Firestore) => handleSocialSignUp(auth, firestore, googleProvider);
export const initiateMicrosoftSignUp = (auth: Auth, firestore: Firestore) => handleSocialSignUp(auth, firestore, microsoftProvider);
export const initiateAppleSignUp = (auth: Auth, firestore: Firestore) => handleSocialSignUp(auth, firestore, appleProvider);

// --- SOCIAL AUTH (SIGN IN) ---

export function initiateGoogleSignIn(authInstance: Auth): Promise<UserCredential> {
    return signInWithPopup(authInstance, googleProvider);
}

export function initiateMicrosoftSignIn(authInstance: Auth): Promise<UserCredential> {
    return signInWithPopup(authInstance, microsoftProvider);
}

export function initiateAppleSignIn(authInstance: Auth): Promise<UserCredential> {
    return signInWithPopup(authInstance, appleProvider);
}


// --- SIGN OUT ---
export function initiateSignOut(authInstance: Auth): Promise<void> {
    return signOut(authInstance);
}
