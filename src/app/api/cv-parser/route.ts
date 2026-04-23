export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseCv } from '@/ai/flows/cv-parser';
import { getAdminFirestore } from '@/firebase/admin';
import { CvDataSchema } from '@/lib/types';
import { logger } from '@/lib/logger';

const JsonBodySchema = z.object({
  cvFile: z.string().min(1),
  userId: z.string().min(1),
});

export const saveCvDataToFirestore = async (userId: string, cvData: z.infer<typeof CvDataSchema>) => {
  const db = getAdminFirestore();
  if (!userId) throw new Error('User ID is required to save CV data.');
  const userDocRef = db.collection('users').doc(userId);
  await userDocRef.set({ ...cvData }, { merge: true });
};

async function normalizeCvInput(req: NextRequest): Promise<{ cvFile: string; userId: string }> {
  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return JsonBodySchema.parse(await req.json());
  }

  const formData = await req.formData();
  const rawCvFile = formData.get('cvFile');
  const rawUserId = formData.get('userId');

  if (typeof rawUserId !== 'string' || !rawUserId) {
    throw new Error('userId is required');
  }

  if (typeof rawCvFile === 'string' && rawCvFile) {
    return { cvFile: rawCvFile, userId: rawUserId };
  }

  if (rawCvFile instanceof File) {
    const bytes = await rawCvFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const cvFile = `data:${rawCvFile.type || 'application/pdf'};base64,${buffer.toString('base64')}`;
    return { cvFile, userId: rawUserId };
  }

  throw new Error('cvFile is required');
}

function ensureDataUri(cvFile: string): string {
  if (cvFile.startsWith('data:')) {
    return cvFile;
  }

  return `data:application/octet-stream;base64,${cvFile}`;
}

export async function POST(req: NextRequest) {
  try {
    const { cvFile, userId } = await normalizeCvInput(req);

    if (!cvFile || !userId) {
      return NextResponse.json({ error: 'cvFile (as a file or data URI) and userId are required' }, { status: 400 });
    }

    const parsedData = await parseCv({ cvFile: ensureDataUri(cvFile) });
    await saveCvDataToFirestore(userId, parsedData);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    const message = error?.message ?? 'Unknown error';
    logger.error('Error in cv-parser API:', { error: message, stack: error?.stack });

    const isClientError =
      error instanceof z.ZodError ||
      message.includes('required') ||
      message.includes('Invalid') ||
      message.includes('too large') ||
      message.includes('must be');

    return NextResponse.json(
      {
        error: isClientError
          ? message
          : 'CV processing failed. Check file size/format (<10MB PDF/image) or AI service status.',
      },
      { status: isClientError ? 400 : 500 }
    );
  }
}
