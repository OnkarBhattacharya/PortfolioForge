export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, getAdminAuth } from '@/firebase/admin';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

const MAX_FREE_ITEMS = 3;

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(token);
    const userId = decoded.uid;

    const { name, description, tags, itemUrl } = await req.json();
    if (!name || !description) {
      return NextResponse.json({ error: 'name and description are required' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    const subscriptionTier = userDoc.data()?.subscriptionTier ?? 'free';

    const itemsRef = db.collection('users').doc(userId).collection('portfolioItems');
    const existingCount = (await itemsRef.count().get()).data().count;

    if (subscriptionTier === 'free' && existingCount >= MAX_FREE_ITEMS) {
      return NextResponse.json({ error: 'Free plan limit reached.' }, { status: 403 });
    }

    const newItemId = uuidv4();
    const imageId = `project-${Math.floor(Math.random() * 5) + 1}`;
    const tagsArray = Array.isArray(tags) ? tags : (tags ?? '').split(',').map((t: string) => t.trim()).filter(Boolean);

    await itemsRef.doc(newItemId).set({
      id: newItemId,
      userProfileId: userId,
      name,
      description,
      itemUrl: itemUrl ?? '',
      tags: tagsArray,
      imageId,
      itemIndex: existingCount,
    });

    return NextResponse.json({ success: true, id: newItemId });
  } catch (error: any) {
    logger.error('Error in portfolio-items API:', { error: error.message });
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
