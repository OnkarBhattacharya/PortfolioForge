import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { openrouterAI } from '@/lib/ai';
import { z } from 'zod';

const ThemeGenerateInputSchema = z.object({
  prompt: z.string().min(10).max(1000),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON' },
      { status: 400 }
    );
  }
  
  const parsed = ThemeGenerateInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }
  
  try {
    const data = await openrouterAI.generateTheme(user.id, parsed.data.prompt);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Theme generate error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate theme';
    const status = message.includes('rate limit') ? 429 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}