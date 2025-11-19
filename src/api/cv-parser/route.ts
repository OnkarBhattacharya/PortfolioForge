
import { NextRequest, NextResponse } from 'next/server';
import { parseCv } from '@/ai/flows/cv-parser';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { z } from 'zod';
import { CvDataSchema } from '@/lib/types';
import { logger } from '@/lib/logger';

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

export const saveCvDataToFirestore = async (userId: string, cvData: z.infer<typeof CvDataSchema>) => {
  const db = getFirestore(getAdminApp());
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
    const parsedData = await parseCv({ cvFile });
    await saveCvDataToFirestore(userId, parsedData);
    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    logger.error('Error in cv-parser API:', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'An unexpected error occurred during CV processing' }, { status: 500 });
  }
}
