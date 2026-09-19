import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const UploadInputSchema = z.object({
  bucket: z.enum(['portfolio-images', 'cv-uploads']),
  fileName: z.string().min(1),
  contentType: z.string().startsWith('image/').or(z.string().startsWith('application/pdf')),
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
  
  const parsed = z.object({
    bucket: z.enum(['portfolio-images', 'cv-uploads']),
    fileName: z.string().min(1),
    contentType: z.string(),
  }).safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }
  
  const { bucket, fileName, contentType } = parsed.data;
  const filePath = `${user.id}/${Date.now()}-${fileName}`;
  
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath, {
        upsert: false,
      });
    
    if (error) {
      console.error('Signed URL error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create upload URL' },
        { status: 500 }
      );
    }
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: data.signedUrl,
        filePath: data.path,
        publicUrl,
        token: data.token,
      },
    });
  } catch (error) {
    console.error('Upload URL error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create upload URL' },
      { status: 500 }
    );
  }
}