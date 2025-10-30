
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@genkit-ai/core';
import { parseCv } from '@/ai/flows/cv-parser';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { z } from 'zod';
import { CvDataSchema } from '@/lib/types';

// Initialize Firebase for server-side operations
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export const saveCvDataToFirestore = async (userId: string, cvData: z.infer<typeof CvDataSchema>) => {
  if (!userId) throw new Error("User ID is required to save CV data.");
  // Save CV data to the user's document by merging the new fields
  const userDocRef = doc(db, 'users', userId);
  // We spread the cvData to merge its fields directly into the user document
  await setDoc(userDocRef, { ...cvData }, { merge: true });
};

export async function POST(req: NextRequest) {
  // SECURITY: In a production environment, the userId should be derived from an authenticated session.
  const { cvFile, userId } = await req.json();

  if (!cvFile || !userId) {
    return NextResponse.json({ error: 'cvFile and userId are required' }, { status: 400 });
  }

  try {
    const parsedData = await parseCv({ cvFile });
    await saveCvDataToFirestore(userId, parsedData);
    
    const response = NextResponse.json({ success: true, data: parsedData });
    return response;
    
  } catch (error: any) {
    console.error('Error in cv-parser API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
