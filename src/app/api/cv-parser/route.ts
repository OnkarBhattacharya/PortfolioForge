
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@genkit-ai/core';
import { cvParserFlow } from '@/ai/flows/cv-parser';
import { saveCvDataToFirestore } from '@/lib/firestore';

export async function POST(req: NextRequest) {
  const { cvText, userId } = await req.json();

  if (!cvText || !userId) {
    return NextResponse.json({ error: 'cvText and userId are required' }, { status: 400 });
  }

  try {
    const parsedData = await run(cvParserFlow, cvText);
    await saveCvDataToFirestore(userId, parsedData);
    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error in cv-parser API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
