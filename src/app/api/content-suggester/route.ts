export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { contentSuggesterFlow } from '@/ai/flows/content-suggester';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { text, contentType } = await req.json();

    if (!text || !contentType) {
      return NextResponse.json({ error: 'text and contentType are required' }, { status: 400 });
    }

    const result = await contentSuggesterFlow({ text, contentType });
    return NextResponse.json(result);
  } catch (error: any) {
    logger.error('Error in content-suggester API:', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'Content suggestions unavailable. AI service may be down. Try again later.' }, { status: 500 });
  }
}
