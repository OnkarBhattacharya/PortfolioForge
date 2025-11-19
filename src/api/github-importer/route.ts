
import { NextRequest, NextResponse } from 'next/server';
import { importGithubRepositories } from '@/ai/flows/github-importer';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

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
  const { username, userId } = await req.json();

  if (!username || !userId) {
    return NextResponse.json({ error: 'Username and userId are required' }, { status: 400 });
  }

  try {
    const db = getFirestore(getAdminApp());
    const repositories = await importGithubRepositories({ username });
    
    if (repositories.length > 0) {
      const portfolioItemsRef = db.collection('users').doc(userId).collection('portfolioItems');
      const batch = db.batch();

      repositories.forEach((project) => {
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
        });
      });

      await batch.commit();
    }
    
    return NextResponse.json({ success: true, importedCount: repositories.length });
    
  } catch (error: any) {
    console.error('Error in github-importer API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
