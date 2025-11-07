
import { translate } from '@/ai/flows/translator';
import {NextRequest, NextResponse} from 'next/server';

export async function POST(req: NextRequest) {
  const { texts, targetLanguage } = await req.json();

  if (!texts || !targetLanguage) {
    return NextResponse.json(
      { error: 'Missing required parameters: texts and targetLanguage' },
      { status: 400 }
    );
  }

  try {
    const { translations } = await translate({ texts, targetLanguage });
    return NextResponse.json({ translations });
  } catch (e: any) {
    console.error('Translation flow failed', e);
    return NextResponse.json(
      { error: 'Translation failed', details: e.message },
      { status: 500 }
    );
  }
}
