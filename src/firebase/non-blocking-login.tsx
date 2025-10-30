
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, Firestore, setDoc, serverTimestamp } from 'firebase/firestore';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';

/**
 * Creates or updates a user profile document in Firestore.
 * This function is called after a new user signs up or an existing user signs in.
 * It uses a non-blocking write and emits a contextual error on permission failure.
 * @param firestore - The Firestore instance.
 * @param user - The user object from Firebase Authentication.
 * @param fullName - The user's full name (optional, for email sign-up).
 */
const createOrUpdateUserProfile = (firestore: Firestore, user: User, fullName?: string) => {
  const userRef = doc(firestore, 'users', user.uid);
  
  const displayName = fullName || user.displayName || 'New User';

  const profileData = {
    id: user.uid,
    email: user.email,
    fullName: displayName,
    photoURL: user.photoURL,
    lastLoginAt: serverTimestamp(),
  };
  
  const newProfileData = {
      ...profileData,
      createdAt: serverTimestamp(),
      themeId: 'default',
  }

  // Non-blocking write with contextual error handling
  setDoc(userRef, profileData, {merge: true})
    .catch((error) => {
        // First check if it's a new user creation error
        getDoc(userRef).then(docSnap => {
            if (!docSnap.exists()) {
                 setDoc(userRef, newProfileData).catch(createError => {
                    const permissionError = new FirestorePermissionError({
                        path: userRef.path,
                        operation: 'create',
                        requestResourceData: newProfileData,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                 });
            } else {
                 const permissionError = new FirestorePermissionError({
                    path: userRef.path,
                    operation: 'update',
                    requestResourceData: profileData,
                });
                errorEmitter.emit('permission-error', permissionError);
            }
        });
    });
    
    if (user.displayName !== displayName) {
        updateProfile(user, { displayName }).catch(e => console.error("Failed to update display name", e));
    }
};


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth) {
  signInAnonymously(authInstance)
    .catch((error) => {
    // This is a non-critical error, so we just log it.
    console.error("Anonymous sign-in failed:", error);
  });
}

/** Initiate email/password sign-up (blocking to allow for profile creation). */
export async function initiateEmailSignUp(authInstance: Auth, firestore: Firestore, email: string, password: string, fullName: string) {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    // The profile creation is now a non-blocking fire-and-forget operation from the UI's perspective
    createOrUpdateUserProfile(firestore, userCredential.user, fullName);
    return userCredential;
}

/** Initiate email/password sign-in (blocking). */
export async function initiateEmailSignIn(authInstance: Auth, firestore: Firestore, email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    createOrUpdateUserProfile(firestore, userCredential.user);
    return userCredential;
}
