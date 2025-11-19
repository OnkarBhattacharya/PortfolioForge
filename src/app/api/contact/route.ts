
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, serverTimestamp } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin';
import { z } from 'zod';

// Initialize Firebase Admin and Firestore
const adminApp = getAdminApp();
const db = getFirestore(adminApp);

const ContactFormSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  name: z.string().min(1, "Name is required."),
  email: z.string().email("A valid email is required."),
  message: z.string().min(1, "Message is required."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = ContactFormSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', issues: validation.error.issues }, { status: 400 });
    }

    const { userId, name, email, message } = validation.data;

    const messagesColRef = db.collection('users').doc(userId).collection('messages');
    
    // Using the Admin SDK, which bypasses security rules.
    // This is appropriate for a server-side endpoint that is meant to have privileged write access.
    await messagesColRef.add({
      name,
      email,
      message,
      createdAt: serverTimestamp(),
      read: false, // To track unread messages
    });
    
    // In a real app, you would also trigger an email notification here.

    return NextResponse.json({ success: true, message: "Your message has been sent successfully!" });
    
  } catch (error: any) {
    console.error('Error in contact API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
