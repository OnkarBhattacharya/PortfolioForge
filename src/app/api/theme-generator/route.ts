
import { NextRequest, NextResponse } from 'next/server';
import { themeGeneratorFlow } from '@/ai/flows/theme-generator';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const themeConfig = await themeGeneratorFlow({ prompt });
    return NextResponse.json(themeConfig);
  } catch (error: any) {
    console.error('Error in theme-generator API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
