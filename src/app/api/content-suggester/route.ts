
import { NextRequest, NextResponse } from 'next/server';
import { contentSuggesterFlow } from '@/ai/flows/content-suggester';

export async function POST(req: NextRequest) {
  const { text, contentType } = await req.json();

  if (!text || !contentType) {
    return NextResponse.json({ error: 'text and contentType are required' }, { status: 400 });
  }

  try {
    const result = await contentSuggesterFlow({ text, contentType });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in content-suggester API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
