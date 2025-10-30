
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
import { setDocumentNonBlocking } from './non-blocking-updates';


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

  // This check is important. We only want to set the initial creation data
  // if the document does not exist. Otherwise, we only update the login time.
  getDoc(userRef).then(docSnap => {
      if (!docSnap.exists()) {
          // Document doesn't exist, so it's a new user sign-up.
          // Create the full profile with 'createdAt' and default theme.
          const newProfileData = {
              id: user.uid,
              email: user.email,
              fullName: displayName,
              photoURL: user.photoURL,
              lastLoginAt: serverTimestamp(),
              createdAt: serverTimestamp(),
              themeId: 'default',
          };
          setDocumentNonBlocking(userRef, newProfileData, {});
      } else {
          // Document exists, so it's a returning user.
          // Only update the 'lastLoginAt' field.
          const updateData = {
              lastLoginAt: serverTimestamp(),
          };
          setDocumentNonBlocking(userRef, updateData, { merge: true });
      }
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
