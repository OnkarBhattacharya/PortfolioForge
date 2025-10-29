
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
import { doc, setDoc, Firestore } from 'firebase/firestore';

// Create stable instances of the providers
const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');
const appleProvider = new OAuthProvider('apple.com');

/**
 * Creates a user profile document in Firestore.
 * This function is called after a new user is created.
 * @param firestore - The Firestore instance.
 * @param user - The user object from Firebase Authentication.
 * @param fullName - The user's full name (optional, for email sign-up).
 */
const createUserProfile = async (firestore: Firestore, user: User, fullName?: string) => {
  const userRef = doc(firestore, 'users', user.uid);
  const profileData = {
    id: user.uid,
    email: user.email,
    fullName: fullName || user.displayName || 'New User',
    photoURL: user.photoURL,
    createdAt: new Date().toISOString(),
  };
  await setDoc(userRef, profileData);
};


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth) {
  signInAnonymously(authInstance).catch((error) => {
    console.error("Anonymous sign-in failed:", error);
    // Optionally, you could re-throw or handle this more visibly
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


/** Handle social sign-in or sign-up (blocking). */
async function handleSocialAuth(auth: Auth, firestore: Firestore, provider: GoogleAuthProvider | OAuthProvider, isSignUp: boolean): Promise<UserCredential> {
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Check if it's a new user by looking at metadata
    const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;

    if (isSignUp && isNewUser) {
        await createUserProfile(firestore, user);
    } else if (isSignUp && !isNewUser) {
        // User already exists, but tried to "sign up" again.
        // We can just let them log in, but we could also show a message.
        console.log("User already exists. Logging them in.");
    }
    
    return userCredential;
}


// --- EXPORTED SIGN-IN/SIGN-UP FUNCTIONS ---

export async function initiateGoogleSignUp(auth: Auth, firestore: Firestore) {
    return handleSocialAuth(auth, firestore, googleProvider, true);
}

export async function initiateMicrosoftSignUp(auth: Auth, firestore: Firestore) {
    return handleSocialAuth(auth, firestore, microsoftProvider, true);
}

export async function initiateAppleSignUp(auth: Auth, firestore: Firestore) {
    return handleSocialAuth(auth, firestore, appleProvider, true);
}

export async function initiateGoogleSignIn(auth: Auth, firestore: Firestore) {
    return handleSocialAuth(auth, firestore, googleProvider, false);
}

export async function initiateMicrosoftSignIn(auth: Auth, firestore: Firestore) {
    return handleSocialAuth(auth, firestore, microsoftProvider, false);
}

export async function initiateAppleSignIn(auth: Auth, firestore: Firestore) {
    return handleSocialAuth(auth, firestore, appleProvider, false);
}
