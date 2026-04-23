export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { appRoute } from '@genkit-ai/next';

function handler(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return appRoute(req);
}

export { handler as GET, handler as POST };
