import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { openrouterAI } from '@/lib/ai';
import { z } from 'zod';

const CvParseInputSchema = z.object({
  cvFile: z.string().describe('A data URI of a CV or resume, which can be an image or a PDF document.'),
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
  
  const parsed = CvParseInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }
  
  try {
    // Validate the data URI
    const validMime = /^data:(application\/pdf|image\/(png|jpeg|jpg|webp));base64,/.test(parsed.data.cvFile);
    if (!validMime) {
      return NextResponse.json(
        { success: false, error: 'Invalid CV format. Use PDF or image (PNG/JPG).' },
        { status: 400 }
      );
    }
    
    // Extract base64 data
    const base64Data = parsed.data.cvFile.split(',')[1];
    const mimeType = parsed.data.cvFile.split(',')[0].split(':')[1].split(';')[0];
    
    const data = await openrouterAI.parseCV(user.id, base64Data, mimeType);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('CV parse error:', error);
    const message = error instanceof Error ? error.message : 'Failed to parse CV';
    const status = message.includes('rate limit') ? 429 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}