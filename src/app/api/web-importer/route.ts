
import { NextRequest, NextResponse } from 'next/server';
import { importFromUrl, WebImporterOutput } from '@/ai/flows/web-importer';
import { collection, writeBatch, getFirestore, doc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { v4 as uuidv4 } from 'uuid';

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export const saveWebImportToFirestore = async (userId: string, url: string, data: WebImporterOutput) => {
  if (!userId) throw new Error("User ID is required.");

  const portfolioItemsRef = collection(db, 'users', userId, 'portfolioItems');
  const batch = writeBatch(db);

  const newItemId = uuidv4();
  const imageId = `project-${Math.floor(Math.random() * 5) + 1}`;

  const newDocRef = doc(portfolioItemsRef, newItemId);
  batch.set(newDocRef, {
    id: newItemId,
    userProfileId: userId,
    name: data.name,
    description: data.description,
    itemUrl: url, // Save the original URL
    tags: data.tags,
    imageId,
  });

  await batch.commit();
};


export async function POST(req: NextRequest) {
  const { url, userId } = await req.json();

  if (!url || !userId) {
    return NextResponse.json({ error: 'URL and userId are required' }, { status: 400 });
  }

  try {
    const importData = await importFromUrl({ url });
    
    await saveWebImportToFirestore(userId, url, importData);
    
    return NextResponse.json({ success: true, name: importData.name });
    
  } catch (error: any) {
    console.error('Error in web-importer API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}

    