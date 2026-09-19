import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { CreateItemInputSchema } from '@/types';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const { data: items, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });
  
  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ success: true, data: items ?? [] });
}

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
  
  const parsed = CreateItemInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }
  
  const { data: item, error } = await supabase
    .from('portfolio_items')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();
  
  if (error) {
    console.error('Item create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create item' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ success: true, data: item }, { status: 201 });
}