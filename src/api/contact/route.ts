
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, serverTimestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const ContactFormSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  name: z.string().min(1, "Name is required."),
  email: z.string().email("A valid email is required."),
  message: z.string().min(1, "Message is required."),
});

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
  const headers = {
    'Access-Control-Allow-Origin': 'https://yourdomain.com',
    'Access-Control-Allow-Methods': 'POST',
  };
  try {
    const adminApp = getAdminApp();
    const db = getFirestore(adminApp);

    const body = await req.json();
    const validation = ContactFormSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', issues: validation.error.issues }, { status: 400, headers });
    }

    const { userId, name, email, message } = validation.data;

    const messagesColRef = db.collection('users').doc(userId).collection('messages');
    
    await messagesColRef.add({
      userProfileId: userId,
      name,
      email,
      message,
      createdAt: serverTimestamp(),
      read: false,
    });
    
    return NextResponse.json({ success: true, message: "Your message has been sent successfully!" }, { headers });
    
  } catch (error: any) {
    logger.error('Error in contact API:', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500, headers });
  }
}
