
import { NextRequest, NextResponse } from 'next/server';
import { parseLinkedInProfile } from '@/ai/flows/linkedin-parser';
import { getAdminFirestore } from '@/firebase/admin';

export async function POST(req: NextRequest) {
  const { profileText, userId } = await req.json();

  if (!profileText || !userId) {
    return NextResponse.json({ error: 'profileText and userId are required' }, { status: 400 });
  }

  try {
    const db = getAdminFirestore();
    const parsedData = await parseLinkedInProfile({ profileText });
    
    const userDocRef = db.collection('users').doc(userId);
    await userDocRef.set({ ...parsedData }, { merge: true });
    
    return NextResponse.json({ success: true, data: parsedData });
    
  } catch (error: any) {
    console.error('Error in linkedin-parser API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
