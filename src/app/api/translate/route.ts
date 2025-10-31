
import { NextRequest, NextResponse } from 'next/server';
import { translateTexts } from '@/ai/flows/translator';

export async function POST(req: NextRequest) {
  const { texts, targetLanguage } = await req.json();

  if (!texts || !Array.isArray(texts) || !targetLanguage) {
    return NextResponse.json({ error: '`texts` (array) and `targetLanguage` are required' }, { status: 400 });
  }

  try {
    const result = await translateTexts({ texts, targetLanguage });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in translate API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred during translation' }, { status: 500 });
  }
}
