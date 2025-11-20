
import { translate } from '@/ai/flows/translator';
import {NextRequest, NextResponse} from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { texts, targetLanguage } = await req.json();

    if (!texts || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required parameters: texts and targetLanguage' },
        { status: 400 }
      );
    }

    const { translations } = await translate({ texts, targetLanguage });
    return NextResponse.json({ translations });
  } catch (e: any) {
    logger.error('Translation flow failed', { error: e.message, stack: e.stack });
    return NextResponse.json(
      { error: 'Translation failed', details: e.message },
      { status: 500 }
    );
  }
}
