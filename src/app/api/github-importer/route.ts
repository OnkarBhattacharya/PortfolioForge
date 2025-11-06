
import { NextRequest, NextResponse } from 'next/server';
import { importGithubRepositories } from '@/ai/flows/github-importer';
import { collection, writeBatch, getFirestore, doc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { v4 as uuidv4 } from 'uuid';

// Correctly initialize Firebase for server-side operations
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export async function POST(req: NextRequest) {
  const { username, userId } = await req.json();

  if (!username || !userId) {
    return NextResponse.json({ error: 'Username and userId are required' }, { status: 400 });
  }

  try {
    const repositories = await importGithubRepositories({ username });
    
    if (repositories.length > 0) {
      const portfolioItemsRef = collection(db, 'users', userId, 'portfolioItems');
      const batch = writeBatch(db);

      repositories.forEach((project) => {
        const newItemId = uuidv4();
        const imageId = `project-${Math.floor(Math.random() * 5) + 1}`;
        const tags = project.language ? [project.language] : [];

        const newDocRef = doc(portfolioItemsRef, newItemId);
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
