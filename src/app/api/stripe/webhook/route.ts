import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getAdminFirestore } from '@/firebase/admin';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const proPriceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
const studioPriceId = process.env.STRIPE_PRICE_STUDIO_MONTHLY;

const mapPriceToTier = (priceId?: string | null) => {
  if (!priceId) return 'free';
  if (priceId === studioPriceId) return 'studio';
  if (priceId === proPriceId) return 'pro';
  return 'free';
};

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook not configured.' },
      { status: 500 }
    );
  }

  const body = await req.text();
  const sig = headers().get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const db = getAdminFirestore();

  const upsertSubscription = async (subscription: Stripe.Subscription) => {
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0]?.price?.id;
    const tier = mapPriceToTier(priceId);
    const status = subscription.status;
    const periodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

    const usersSnap = await db
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnap.empty) return;
    const userDoc = usersSnap.docs[0];

    await userDoc.ref.set(
      {
        subscriptionTier: tier,
        subscriptionStatus: status,
        subscriptionPeriodEndDate: periodEnd,
      },
      { merge: true }
    );
  };

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await upsertSubscription(subscription);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await upsertSubscription(subscription);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
