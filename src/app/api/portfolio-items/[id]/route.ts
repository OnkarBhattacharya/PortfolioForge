import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { UpdateItemInputSchema } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const { id } = await params;
  
  const { data: item, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  
  if (error || !item) {
    return NextResponse.json(
      { success: false, error: 'Item not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true, data: item });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const { id } = await params;
  
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON' },
      { status: 400 }
    );
  }
  
  const parsed = UpdateItemInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }
  
  const { data: item, error } = await supabase
    .from('portfolio_items')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error || !item) {
    return NextResponse.json(
      { success: false, error: 'Item not found or update failed' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true, data: item });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const { id } = await params;
  
  const { error } = await supabase
    .from('portfolio_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ success: true });
}