
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@genkit-ai/core';
import { parseCv, CvDataSchema } from '@/ai/flows/cv-parser';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { z } from 'zod';

// Initialize Firebase Admin for server-side operations
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export const saveCvDataToFirestore = async (userId: string, cvData: z.infer<typeof CvDataSchema>) => {
  if (!userId) throw new Error("User ID is required to save CV data.");
  // Save CV data to a `cv` field within the user's document
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, { cv: cvData }, { merge: true });
};

export async function POST(req: NextRequest) {
  // SECURITY: In a production environment, the userId should be derived from an authenticated session.
  const { cvFile, userId } = await req.json();

  if (!cvFile || !userId) {
    return NextResponse.json({ error: 'cvFile and userId are required' }, { status: 400 });
  }

  try {
    const parsedData = await run(parseCv, cvFile);
    await saveCvDataToFirestore(userId, parsedData);
    
    // Store a marker in local storage to indicate success
    const response = NextResponse.json({ success: true, data: parsedData });
    return response;
    
  } catch (error: any) {
    console.error('Error in cv-parser API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
