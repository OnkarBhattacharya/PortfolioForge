
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@genkit-ai/core';
import { parseLinkedInProfile } from '@/ai/flows/linkedin-parser';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { z } from 'zod';
import { CvDataSchema } from '@/lib/types';

// Initialize Firebase Admin for server-side operations
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export const saveLinkedInDataToFirestore = async (userId: string, cvData: z.infer<typeof CvDataSchema>) => {
  if (!userId) throw new Error("User ID is required to save CV data.");
  // Save parsed data by merging it into the user's document
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, { ...cvData }, { merge: true });
};

export async function POST(req: NextRequest) {
  const { linkedInData, userId } = await req.json();

  if (!linkedInData || !userId) {
    return NextResponse.json({ error: 'linkedInData and userId are required' }, { status: 400 });
  }

  try {
    const parsedData = await run(parseLinkedInProfile, linkedInData);
    await saveLinkedInDataToFirestore(userId, parsedData);
    
    return NextResponse.json({ success: true, data: parsedData });
    
  } catch (error: any) {
    console.error('Error in linkedin-parser API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
