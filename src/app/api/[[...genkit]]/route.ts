export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

// Genkit dev UI endpoint - disabled in production
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Genkit dev UI not configured' });
}

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Genkit dev UI not configured' });
}
