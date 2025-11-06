
import { NextRequest, NextResponse } from 'next/server';
import { parseLinkedInProfile } from '@/ai/flows/linkedin-parser';
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
  const { linkedInData, userId } = await req.json();

  if (!linkedInData || !userId) {
    return NextResponse.json({ error: 'linkedInData and userId are required' }, { status: 400 });
  }

  try {
    const parsedData = await parseLinkedInProfile(linkedInData);
    
    const userDocRef = db.collection('users').doc(userId);
    await userDocRef.set({ ...parsedData }, { merge: true });
    
    return NextResponse.json({ success: true, data: parsedData });
    
  } catch (error: any) {
    console.error('Error in linkedin-parser API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
