
import { NextRequest, NextResponse } from 'next/server';
import { parseCv } from '@/ai/flows/cv-parser';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin';
import { z } from 'zod';
import { CvDataSchema } from '@/lib/types';

// Initialize Firebase Admin and Firestore
const adminApp = getAdminApp();
const db = getFirestore(adminApp);

export const saveCvDataToFirestore = async (userId: string, cvData: z.infer<typeof CvDataSchema>) => {
  if (!userId) throw new Error("User ID is required to save CV data.");
  const userDocRef = db.collection('users').doc(userId);
  await userDocRef.set({ ...cvData }, { merge: true });
};

export async function POST(req: NextRequest) {
  const { cvFile, userId } = await req.json();

  if (!cvFile || !userId) {
    return NextResponse.json({ error: 'cvFile (as data URI) and userId are required' }, { status: 400 });
  }

  try {
    // 1. Call the Genkit flow to parse the CV
    const parsedData = await parseCv({ cvFile });
    
    // 2. Save the parsed data to Firestore using the Admin SDK
    await saveCvDataToFirestore(userId, parsedData);
    
    // 3. Return the parsed data to the client
    return NextResponse.json({ success: true, data: parsedData });
    
  } catch (error: any) {
    console.error('Error in cv-parser API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred during CV processing' }, { status: 500 });
  }
}
