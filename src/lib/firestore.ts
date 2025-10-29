
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export const saveCvDataToFirestore = async (userId: string, cvData: any) => {
  if (!userId) throw new Error("User ID is required to save CV data.");
  const userDocRef = doc(db, 'cvData', userId);
  await setDoc(userDocRef, { parsedData: cvData }, { merge: true });
};
