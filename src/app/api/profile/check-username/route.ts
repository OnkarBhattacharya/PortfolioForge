import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  
  if (!username || username.length < 3) {
    return NextResponse.json({ available: false });
  }
  
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();
  
  return NextResponse.json({ available: !data });
}