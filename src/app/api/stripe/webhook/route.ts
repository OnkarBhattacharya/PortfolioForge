import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import * as adminModule from '@/firebase/admin';

type StripeEvent = Stripe.Event;
type UserRecord = Record<string, unknown>;

function jsonError(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

function getDbHelper() {
  const mod = adminModule as Record<string, unknown>;
  const dbHelper = mod.getAdminDb ?? mod.getAdminFirestore ?? mod.db;

  if (typeof dbHelper === 'function') {
    return dbHelper();
  }

  if (dbHelper) {
    return dbHelper;
  }

  throw new Error('Firebase Admin Firestore is not initialized.');
}

function createStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe secret key is not configured.');
  }

  return new Stripe(secretKey);
}

function getWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Stripe webhook secret is not configured.');
  }

  return webhookSecret;
}

function getCustomerIdFromObject(object: StripeEvent['data']['object']): string | null {
  if (typeof object !== 'object' || object === null) {
    return null;
  }

  const candidate = (object as { customer?: string | Stripe.Customer | null }).customer;
  if (typeof candidate === 'string' && candidate.trim()) {
    return candidate.trim();
  }

  return null;
}

function getUserIdFromMetadata(object: StripeEvent['data']['object']): string | null {
  if (typeof object !== 'object' || object === null) {
    return null;
  }

  const metadata = (object as { metadata?: Record<string, string | undefined> }).metadata;
  const userId = metadata?.userId;
  return typeof userId === 'string' && userId.trim() ? userId.trim() : null;
}

function toIsoDate(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value * 1000).toISOString();
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return null;
}

async function findUserByCustomerId(customerId: string): Promise<{ id: string; data: UserRecord } | null> {
  const db = getDbHelper();
  const collections = ['users'];

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).where('stripeCustomerId', '==', customerId).limit(1).get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, data: doc.data() as UserRecord };
    }

    const fallbackSnapshot = await db.collection(collectionName).where('customerId', '==', customerId).limit(1).get();
    if (!fallbackSnapshot.empty) {
      const doc = fallbackSnapshot.docs[0];
      return { id: doc.id, data: doc.data() as UserRecord };
    }
  }

  return null;
}

async function updateUserBillingProfile(userId: string, data: Record<string, unknown>) {
  const db = getDbHelper();
  await db.collection('users').doc(userId).set(
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

async function handleCheckoutSessionCompleted(event: StripeEvent) {
  const session = event.data.object as Stripe.Checkout.Session;
  const customerId = typeof session.customer === 'string' ? session.customer : null;
  const userId = getUserIdFromMetadata(session) || (customerId ? (await findUserByCustomerId(customerId))?.id ?? null : null);

  if (!userId) {
    console.warn('[stripe/webhook] checkout.session.completed missing user mapping', {
      sessionId: session.id,
      customerId,
    });
    return;
  }

  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;
  const customerEmail = typeof session.customer_details?.email === 'string' ? session.customer_details.email : null;

  await updateUserBillingProfile(userId, {
    stripeCustomerId: customerId ?? null,
    stripeCustomerEmail: customerEmail,
    stripeCheckoutSessionId: session.id,
    stripeSubscriptionId: subscriptionId,
    checkoutCompletedAt: new Date().toISOString(),
    subscriptionStatus: 'active',
  });
}

async function handleSubscriptionChange(event: StripeEvent, statusOverride?: string) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : null;

  if (!customerId) {
    console.warn('[stripe/webhook] subscription event missing customer id', {
      eventId: event.id,
      type: event.type,
    });
    return;
  }

  const user = await findUserByCustomerId(customerId);
  if (!user) {
    console.warn('[stripe/webhook] no user found for customer', {
      eventId: event.id,
      type: event.type,
      customerId,
    });
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const priceNickname = subscription.items.data[0]?.price?.nickname ?? null;
  const currentPeriodEnd = toIsoDate(subscription.current_period_end);

  await updateUserBillingProfile(user.id, {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    stripePriceNickname: priceNickname,
    subscriptionStatus: statusOverride ?? subscription.status,
    subscriptionCurrentPeriodEnd: currentPeriodEnd,
    subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end,
    subscriptionCancelledAt: subscription.canceled_at ? toIsoDate(subscription.canceled_at) : null,
  });
}

async function handleInvoiceEvent(event: StripeEvent, paymentStatus: 'paid' | 'failed') {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;

  if (!customerId) {
    console.warn('[stripe/webhook] invoice event missing customer id', {
      eventId: event.id,
      type: event.type,
    });
    return;
  }

  const user = await findUserByCustomerId(customerId);
  if (!user) {
    console.warn('[stripe/webhook] no user found for invoice customer', {
      eventId: event.id,
      type: event.type,
      customerId,
    });
    return;
  }

  await updateUserBillingProfile(user.id, {
    stripeCustomerId: customerId,
    latestInvoiceId: invoice.id,
    latestInvoiceStatus: paymentStatus,
    latestInvoiceAmountPaid: invoice.amount_paid,
    latestInvoiceCurrency: invoice.currency,
    latestInvoiceAt: new Date().toISOString(),
    subscriptionStatus: paymentStatus === 'paid' ? 'active' : 'past_due',
  });
}

export async function POST(request: Request) {
  let stripe: Stripe;
  try {
    stripe = createStripeClient();
  } catch (error) {
    console.error('[stripe/webhook] missing Stripe configuration', error);
    return jsonError(error instanceof Error ? error.message : 'Stripe is not configured.', 500);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return jsonError('Unable to read webhook payload.', 400);
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return jsonError('Missing Stripe signature.', 400);
  }

  let event: StripeEvent;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, getWebhookSecret());
  } catch (error) {
    console.error('[stripe/webhook] signature verification failed', error);
    return jsonError('Invalid Stripe signature.', 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event, 'canceled');
        break;
      case 'invoice.payment_succeeded':
        await handleInvoiceEvent(event, 'paid');
        break;
      case 'invoice.payment_failed':
        await handleInvoiceEvent(event, 'failed');
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[stripe/webhook] event processing failed', {
      eventId: event.id,
      type: event.type,
      error,
    });
    return jsonError('Stripe webhook processing failed.', 500);
  }
}