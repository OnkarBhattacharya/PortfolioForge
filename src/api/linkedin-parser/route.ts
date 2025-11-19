
import { NextRequest, NextResponse } from 'next/server';
import { parseLinkedInProfile } from '@/ai/flows/linkedin-parser';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set.');
  }

  return initializeApp({
    credential: cert(JSON.parse(serviceAccountKey)),
  });
}

export async function POST(req: NextRequest) {
  const { profileText, userId } = await req.json();

  if (!profileText || !userId) {
    return NextResponse.json({ error: 'profileText and userId are required' }, { status: 400 });
  }

  try {
    const db = getFirestore(getAdminApp());
    const parsedData = await parseLinkedInProfile({ profileText });
    
    const userDocRef = db.collection('users').doc(userId);
    await userDocRef.set({ ...parsedData }, { merge: true });
    
    return NextResponse.json({ success: true, data: parsedData });
    
  } catch (error: any) {
    console.error('Error in linkedin-parser API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
