
import { NextRequest, NextResponse } from 'next/server';
import { importFromUrl } from '@/ai/flows/web-importer';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { logger } from '@/lib/logger';

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set.');
  }

  return initializeApp({
    credential: cert(JSON.parse(serviceAccountKey)),
  });
}

export async function POST(req: NextRequest) {
  const { url, userId } = await req.json();

  if (!url || !userId) {
    return NextResponse.json({ error: 'URL and userId are required' }, { status: 400 });
  }

  try {
    const db = getFirestore(getAdminApp());
    const importData = await importFromUrl({ url });
        
    const portfolioItemsRef = db.collection('users').doc(userId).collection('portfolioItems');
    const newItemId = uuidv4();
    const imageId = `project-${Math.floor(Math.random() * 5) + 1}`;

    const newDocRef = portfolioItemsRef.doc(newItemId);
    await newDocRef.set({
        id: newItemId,
        userProfileId: userId,
        name: importData.name,
        description: importData.description,
        itemUrl: url,
        tags: importData.tags,
        imageId,
    });
    
    return NextResponse.json({ success: true, name: importData.name });
    
  } catch (error: any) {
    logger.error('Error in web-importer API:', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
