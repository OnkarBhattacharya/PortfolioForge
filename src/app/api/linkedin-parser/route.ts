
import { NextRequest, NextResponse } from 'next/server';
import { parseLinkedInProfile } from '@/ai/flows/linkedin-parser';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Correctly initialize Firebase for server-side operations
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();


export async function POST(req: NextRequest) {
  const { linkedInData, userId } = await req.json();

  if (!linkedInData || !userId) {
    return NextResponse.json({ error: 'linkedInData and userId are required' }, { status: 400 });
  }

  try {
    const parsedData = await parseLinkedInProfile(linkedInData);
    
    if (!userId) throw new Error("User ID is required to save data.");
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { ...parsedData }, { merge: true });
    
    return NextResponse.json({ success: true, data: parsedData });
    
  } catch (error: any) {
    console.error('Error in linkedin-parser API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
