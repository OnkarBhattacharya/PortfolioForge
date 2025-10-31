
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { z } from 'zod';

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

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

    const messagesColRef = collection(db, 'users', userId, 'messages');
    
    // Note: In a real-world scenario, you would not use addDoc from the client SDK
    // in a public API route without strict authentication and security rules.
    // We are simulating a secure backend function here. The security rules MUST
    // be configured to deny write access to this collection from the public.
    // For this project, we assume a Firebase Function would handle this.
    await addDoc(messagesColRef, {
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
