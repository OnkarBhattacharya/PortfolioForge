
import { NextRequest, NextResponse } from 'next/server';
import { parseCv } from '@/ai/flows/cv-parser';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Correctly initialize Firebase for server-side operations
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export async function POST(req: NextRequest) {
  const { cvFile, userId } = await req.json();

  if (!cvFile || !userId) {
    return NextResponse.json({ error: 'cvFile (as data URI) and userId are required' }, { status: 400 });
  }

  try {
    // 1. Call the Genkit flow to parse the CV
    const parsedData = await parseCv({ cvFile });
    
    // 2. Save the parsed data to Firestore
    if (!userId) throw new Error("User ID is required to save CV data.");
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { ...parsedData }, { merge: true });
    
    // 3. Return the parsed data to the client
    return NextResponse.json({ success: true, data: parsedData });
    
  } catch (error: any) {
    console.error('Error in cv-parser API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred during CV processing' }, { status: 500 });
  }
}
