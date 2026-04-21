
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

  // Validate dataURI format and size (rough check: <10MB base64)
  if (!cvFile.startsWith('data:') || cvFile.length > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Invalid or oversized CV file (max 10MB)' }, { status: 400 });
  }

  try {
    const parsedData = await parseCv({ cvFile });
    await saveCvDataToFirestore(userId, parsedData);
    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    logger.error('Error in cv-parser API:', { 
      error: error.message, 
      stack: error.stack,
      cvFilePreview: cvFile.substring(0, 100) + '...',
      userId 
    });
    return NextResponse.json({ 
      error: error.message?.includes('model') ? 'AI model failed to process CV (check file format: PDF/image)' : 'CV processing failed' 
    }, { status: 500 });
  }
}
