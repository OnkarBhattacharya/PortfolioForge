export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { parseLinkedInProfile } from '@/ai/flows/linkedin-parser';
import { getAdminFirestore } from '@/firebase/admin';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const db = getAdminFirestore();
    const { profileText, userId } = await req.json();

    if (!profileText || !userId) {
      return NextResponse.json({ error: 'profileText and userId are required' }, { status: 400 });
    }

    const parsedData = await parseLinkedInProfile({ profileText });
    
    const userDocRef = db.collection('users').doc(userId);
    await userDocRef.set({ ...parsedData }, { merge: true });
    
    return NextResponse.json({ success: true, data: parsedData });
    
  } catch (error: any) {
    logger.error('Error in linkedin-parser API:', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
