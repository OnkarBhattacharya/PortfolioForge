
import { NextRequest, NextResponse } from 'next/server';
import { parseCv } from '@/ai/flows/cv-parser';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

const db = admin.firestore();

export async function POST(req: NextRequest) {
  const { cvFile, userId } = await req.json();

  if (!cvFile || !userId) {
    return NextResponse.json({ error: 'cvFile (as data URI) and userId are required' }, { status: 400 });
  }

  try {
    // 1. Call the Genkit flow to parse the CV
    const parsedData = await parseCv({ cvFile });
    
    // 2. Save the parsed data to Firestore using the Admin SDK
    const userDocRef = db.collection('users').doc(userId);
    await userDocRef.set({ ...parsedData }, { merge: true });
    
    // 3. Return the parsed data to the client
    return NextResponse.json({ success: true, data: parsedData });
    
  } catch (error: any) {
    console.error('Error in cv-parser API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred during CV processing' }, { status: 500 });
  }
}
