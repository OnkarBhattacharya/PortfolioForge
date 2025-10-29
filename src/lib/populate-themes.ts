
'use server';
import { initializeFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { themes } from './data';

export async function populateThemes() {
  const { firestore } = initializeFirebase();
  const themesCollection = collection(firestore, 'themes');
  const batch = writeBatch(firestore);

  themes.forEach((theme) => {
    const themeRef = doc(themesCollection, theme.id);
    batch.set(themeRef, theme);
  });

  try {
    await batch.commit();
    console.log('Successfully populated themes collection!');
    return { success: true };
  } catch (error) {
    console.error('Error populating themes:', error);
    return { success: false, error };
  }
}
