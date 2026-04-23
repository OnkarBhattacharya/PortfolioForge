export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { parseCv } from '@/ai/flows/cv-parser';
import { getAdminFirestore } from '@/firebase/admin';
import { z } from 'zod';
import { CvDataSchema } from '@/lib/types';
import { logger } from '@/lib/logger';

export const saveCvDataToFirestore = async (userId: string, cvData: z.infer<typeof CvDataSchema>) => {
  const db = getAdminFirestore();
  if (!userId) throw new Error("User ID is required to save CV data.");
  const userDocRef = db.collection('users').doc(userId);
  await userDocRef.set({ ...cvData }, { merge: true });
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const cvFile = formData.get('cvFile') as File;
    const userId = formData.get('userId') as string;

    if (!cvFile || !userId) {
      return NextResponse.json({ error: 'cvFile (as a file) and userId are required' }, { status: 400 });
    }

    const bytes = await cvFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const cvFileAsDataUri = `data:${cvFile.type};base64,${buffer.toString('base64')}`;

    const parsedData = await parseCv({ cvFile: cvFileAsDataUri });
    await saveCvDataToFirestore(userId, parsedData);
    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any)
   {
    logger.error('Error in cv-parser API:', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'CV processing failed. Check file size/format (<10MB PDF/image) or AI service status.' }, { status: 500 });
  }
}
