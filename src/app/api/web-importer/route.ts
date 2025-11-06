
import { NextRequest, NextResponse } from 'next/server';
import { importFromUrl } from '@/ai/flows/web-importer';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { v4 as uuidv4 } from 'uuid';

// Correctly initialize Firebase for server-side operations
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export async function POST(req: NextRequest) {
  const { url, userId } = await req.json();

  if (!url || !userId) {
    return NextResponse.json({ error: 'URL and userId are required' }, { status: 400 });
  }

  try {
    const importData = await importFromUrl({ url });
    
    if (!userId) throw new Error("User ID is required.");
    
    const portfolioItemsRef = collection(db, 'users', userId, 'portfolioItems');
    const newItemId = uuidv4();
    const imageId = `project-${Math.floor(Math.random() * 5) + 1}`;

    await addDoc(portfolioItemsRef, {
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
    console.error('Error in web-importer API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
