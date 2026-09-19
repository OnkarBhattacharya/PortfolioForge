import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { UpdateProfileInputSchema } from '@/types';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  const { data: items } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });
  
  return NextResponse.json({ success: true, data: { profile, items: items ?? [] } });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }
  
  const parsed = UpdateProfileInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }
  
  // Check username uniqueness if being updated
  if (parsed.data.username) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', parsed.data.username)
      .neq('id', user.id)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Username already taken', code: 'USERNAME_TAKEN' },
        { status: 409 }
      );
    }
  }
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', user.id)
    .select()
    .single();
  
  if (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ success: true, data: profile });
}