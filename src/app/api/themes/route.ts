import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  const { data: themes, error } = await supabase
    .from('themes')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ success: true, data: themes ?? [] });
}