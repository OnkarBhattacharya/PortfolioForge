
import { NextRequest, NextResponse } from 'next/server';
import { cvParserFlow } from '@/ai/flows/cv-parser';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getFirestore } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';


// This is a workaround to initialize Firebase in a server context
// where the client-side initialization might not have run.
if (getApps().length === 0) {
  initializeApp(db);
}
const firestore = getFirestore();

export const saveCvDataToFirestore = async (userId: string, cvData: any) => {
  if (!userId) throw new Error("User ID is required to save CV data.");
  const userDocRef = doc(firestore, 'cvData', userId);
  await setDoc(userDocRef, { parsedData: cvData }, { merge: true });
};


export async function POST(req: NextRequest) {
  const { cvImage, userId } = await req.json();

  if (!cvImage || !userId) {
    return NextResponse.json({ error: 'cvImage and userId are required' }, { status: 400 });
  }

  try {
    const parsedData = await cvParserFlow({ cvImage });
    await saveCvDataToFirestore(userId, parsedData);
    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error in cv-parser API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}

