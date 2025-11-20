
import { NextRequest, NextResponse } from 'next/server';
import { serverTimestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { getAdminFirestore } from '@/firebase/admin';
import { logger } from '@/lib/logger';

const ContactFormSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  name: z.string().min(1, "Name is required."),
  email: z.string().email("A valid email is required."),
  message: z.string().min(1, "Message is required."),
});

export async function POST(req: NextRequest) {
  try {
    const db = getAdminFirestore();

    const body = await req.json();
    const validation = ContactFormSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', issues: validation.error.issues }, { status: 400 });
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
    
    return NextResponse.json({ success: true, message: "Your message has been sent successfully!" });
    
  } catch (error: any) {
    logger.error('Error in contact API:', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
