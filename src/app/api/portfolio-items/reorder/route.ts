import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const ReorderSchema = z.object({
  itemIds: z.array(z.string().uuid()),
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
  
  const parsed = ReorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }
  
  const updates = parsed.data.itemIds.map((id, index) => 
    supabase
      .from('portfolio_items')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('user_id', user.id)
  );
  
  await Promise.all(updates);
  
  return NextResponse.json({ success: true });
}