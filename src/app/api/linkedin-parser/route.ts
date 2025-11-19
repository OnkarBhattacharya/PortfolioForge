
import { NextRequest, NextResponse } from 'next/server';
import { parseLinkedInProfile } from '@/ai/flows/linkedin-parser';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin';

// Initialize Firebase Admin and Firestore
const adminApp = getAdminApp();
const db = getFirestore(adminApp);

export async function POST(req: NextRequest) {
  const { profileText, userId } = await req.json();

  if (!profileText || !userId) {
    return NextResponse.json({ error: 'profileText and userId are required' }, { status: 400 });
  }

  try {
    // 1. Call the Genkit flow to parse the LinkedIn data
    const parsedData = await parseLinkedInProfile({ profileText });
    
    // 2. Save the parsed data to Firestore using the Admin SDK
    const userDocRef = db.collection('users').doc(userId);
    await userDocRef.set({ ...parsedData }, { merge: true });
    
    // 3. Return the parsed data to the client
    return NextResponse.json({ success: true, data: parsedData });
    
  } catch (error: any) {
    console.error('Error in linkedin-parser API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
