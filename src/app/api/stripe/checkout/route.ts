import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getAdminAuth, getAdminFirestore } from '@/firebase/admin';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const priceMap: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY,
  studio: process.env.STRIPE_PRICE_STUDIO_MONTHLY,
};

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured.' },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    const { plan } = await req.json();
    if (!decoded?.uid || !plan) {
      return NextResponse.json(
        { error: 'plan is required' },
        { status: 400 }
      );
    }
    if (plan === 'free') {
      return NextResponse.json(
        { error: 'Free plan does not require checkout.' },
        { status: 400 }
      );
    }

    const priceId = priceMap[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price is not configured for this plan.' },
        { status: 500 }
      );
    }

    const db = getAdminFirestore();
    const userId = decoded.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data() || {};

    let customerId = userData.stripeCustomerId as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email || undefined,
        name: userData.fullName || undefined,
        metadata: { userId },
      });
      customerId = customer.id;
      await db.collection('users').doc(userId).set(
        { stripeCustomerId: customerId },
        { merge: true }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/billing?success=1`,
      cancel_url: `${APP_URL}/billing?canceled=1`,
      metadata: { userId, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Checkout session failed' },
      { status: 500 }
    );
  }
}
