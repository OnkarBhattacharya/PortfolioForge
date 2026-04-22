export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { importGithubRepositories } from '@/ai/flows/github-importer';
import { getAdminFirestore } from '@/firebase/admin';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const db = getAdminFirestore();
    const { username, userId } = await req.json();

    if (!username || !userId) {
      return NextResponse.json({ error: 'Username and userId are required' }, { status: 400 });
    }
    
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data() || {};
    const subscriptionTier = userData.subscriptionTier || 'free';

    const portfolioItemsRef = db.collection('users').doc(userId).collection('portfolioItems');
    const existingItems = await portfolioItemsRef.get();
    const existingCount = existingItems.size;
    const maxFreeItems = 3;

    if (subscriptionTier === 'free' && existingCount >= maxFreeItems) {
      return NextResponse.json({ error: 'Free plan limit reached.' }, { status: 403 });
    }

    const repositories = await importGithubRepositories({ username });
    const remainingSlots = subscriptionTier === 'free'
      ? Math.max(0, maxFreeItems - existingCount)
      : repositories.length;
    const allowedRepos = subscriptionTier === 'free'
      ? repositories.slice(0, remainingSlots)
      : repositories;
    
    if (allowedRepos.length > 0) {
      const batch = db.batch();

      allowedRepos.forEach((project, index) => {
        const newItemId = uuidv4();
        const imageId = `project-${Math.floor(Math.random() * 5) + 1}`;
        const tags = project.language ? [project.language] : [];

        const newDocRef = portfolioItemsRef.doc(newItemId);
        batch.set(newDocRef, {
          id: newItemId,
          userProfileId: userId,
          name: project.name,
          description: project.description,
          itemUrl: project.url,
          tags: tags,
          imageId,
          itemIndex: existingCount + index,
        });
      });

      await batch.commit();
    }
    
    return NextResponse.json({ success: true, importedCount: allowedRepos.length });
    
  } catch (error: any) {
    logger.error('Error in github-importer API:', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
