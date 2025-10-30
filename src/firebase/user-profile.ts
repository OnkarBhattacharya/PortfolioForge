
'use client';
import { doc, setDoc, Firestore } from 'firebase/firestore';
import { setDocumentNonBlocking } from './non-blocking-updates';
import { CvData } from '@/lib/types';

/**
 * Saves parsed CV data to a user's profile in Firestore.
 * This function merges the new data with any existing data in the document.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user whose profile is to be updated.
 * @param cvData - The parsed CV data to save.
 */
export const updateUserProfileData = (
  firestore: Firestore,
  userId: string,
  cvData: CvData
) => {
  if (!userId) {
    throw new Error('User ID is required to save data.');
  }
  const userDocRef = doc(firestore, 'users', userId);
  // Use the non-blocking update function to merge data into the user's profile
  setDocumentNonBlocking(userDocRef, cvData, { merge: true });
};
