export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { themeGeneratorFlow } from '@/ai/flows/theme-generator';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const themeConfig = await themeGeneratorFlow({ prompt });
    return NextResponse.json(themeConfig);
  } catch (error: any) {
    logger.error('Error in theme-generator API:', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
