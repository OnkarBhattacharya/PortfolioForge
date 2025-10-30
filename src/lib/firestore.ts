
import { doc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { getApps, initializeApp } from 'firebase/app';

// This is a workaround to initialize Firebase in a server context
// where the client-side initialization might not have run.
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();


export const saveCvDataToFirestore = async (userId: string, cvData: any) => {
  if (!userId) throw new Error("User ID is required to save CV data.");
  const userDocRef = doc(db, 'cvData', userId);
  await setDoc(userDocRef, { parsedData: cvData }, { merge: true });
};
