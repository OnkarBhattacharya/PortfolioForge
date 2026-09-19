import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { openrouterAI } from '@/lib/ai';
import { z } from 'zod';

const ReadmeSummarizeInputSchema = z.object({
  readmeContent: z.string().min(50),
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
  
  const parsed = ReadmeSummarizeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }
  
  try {
    const data = await openrouterAI.summarizeReadme(user.id, parsed.data.readmeContent);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('README summarize error:', error);
    const message = error instanceof Error ? error.message : 'Failed to summarize README';
    const status = message.includes('rate limit') ? 429 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}