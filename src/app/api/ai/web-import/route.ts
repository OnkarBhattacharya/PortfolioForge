import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { openrouterAI } from '@/lib/ai';
import { z } from 'zod';

const WebImportInputSchema = z.object({
  url: z.string().url(),
});

function isPrivateIP(hostname: string): boolean {
  try {
    const url = new URL(`http://${hostname}`);
    const ip = url.hostname;
    return (
      ip.startsWith('10.') ||
      ip.startsWith('192.168.') ||
      ip.startsWith('172.16.') ||
      ip.startsWith('127.') ||
      ip === 'localhost' ||
      ip === '0.0.0.0'
    );
  } catch {
    return true;
  }
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
  
  const parsed = WebImportInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }
  
  try {
    const url = new URL(parsed.data.url);
    
    // SSRF protection
    if (isPrivateIP(url.hostname)) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL' },
        { status: 400 }
      );
    }
    
    // Fetch the page
    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'PortfolioForge/1.0' },
      redirect: 'follow',
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch URL' },
        { status: 400 }
      );
    }
    
    const html = await response.text();
    
    const data = await openrouterAI.importWeb(user.id, parsed.data.url, html);
    
    // Create portfolio item
    const { data: item } = await supabase
      .from('portfolio_items')
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        content_md: data.content_md,
        tags: data.tags,
        project_url: parsed.data.url,
        sort_order: 0,
      })
      .select()
      .single();
    
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Web import error:', error);
    const message = error instanceof Error ? error.message : 'Failed to import from URL';
    const status = message.includes('rate limit') ? 429 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}