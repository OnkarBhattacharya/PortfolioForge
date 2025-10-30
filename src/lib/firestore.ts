
import { doc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';


// This is a workaround to initialize Firebase in a server context
// where the client-side initialization might not have run.
if (getApps().length === 0) {
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        initializeApp(firebaseConfig);
    }
}
const db = getFirestore();


export const saveCvDataToFirestore = async (userId: string, cvData: any) => {
  if (!userId) throw new Error("User ID is required to save CV data.");
  const userDocRef = doc(db, 'cvData', userId);
  await setDoc(userDocRef, { parsedData: cvData }, { merge: true });
};
