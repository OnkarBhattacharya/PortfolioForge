
import { NextRequest, NextResponse } from 'next/server';
import { importFromUrl } from '@/ai/flows/web-importer';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { getAdminApp } from '@/firebase/admin';

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
    console.error('Error in web-importer API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
