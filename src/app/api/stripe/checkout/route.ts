import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import * as adminModule from '@/firebase/admin';

type RequestBody = Record<string, unknown>;

function jsonError(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

function getAuthHelper() {
  const mod = adminModule as Record<string, unknown>;
  const authHelper = mod.getAdminAuth ?? mod.adminAuth ?? mod.auth;

  if (typeof authHelper === 'function') {
    return authHelper();
  }

  if (authHelper) {
    return authHelper;
  }

  throw new Error('Firebase Admin auth is not initialized.');
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

function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header) return null;

  const [scheme, token, ...rest] = header.trim().split(/\s+/);
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token || rest.length > 0) {
    return null;
  }

  return token;
}

async function verifyRequestUser(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return { errorResponse: jsonError('Unauthorized.', 401) };
  }

  try {
    const decoded = await getAuthHelper().verifyIdToken(token);
    return { uid: decoded.uid, decoded };
  } catch {
    return { errorResponse: jsonError('Unauthorized.', 401) };
  }
}

async function readRequestBody(request: Request): Promise<RequestBody> {
  try {
    const json = await request.json();
    if (json && typeof json === 'object' && !Array.isArray(json)) {
      return json as RequestBody;
    }
  } catch {
    // ignore
  }

  return {};
}

function createStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe secret key is not configured.');
  }

  return new Stripe(secretKey);
}

function getAppUrl(request: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    try {
      return new URL(envUrl).origin;
    } catch {
      // ignore invalid env value
    }
  }

  return new URL(request.url).origin;
}

function resolvePriceId(body: RequestBody): { priceId: string; plan: string | null } {
  const rawPriceId = typeof body.priceId === 'string' ? body.priceId.trim() : '';
  if (rawPriceId) {
    return { priceId: rawPriceId, plan: typeof body.plan === 'string' ? body.plan.trim() || null : null };
  }

  const plan = typeof body.plan === 'string' ? body.plan.trim().toLowerCase() : '';
  const priceMap: Record<string, string | undefined> = {
    starter: process.env.STRIPE_STARTER_PRICE_ID || process.env.STRIPE_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
    premium: process.env.STRIPE_PREMIUM_PRICE_ID,
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_ID,
    yearly: process.env.STRIPE_YEARLY_PRICE_ID,
    annual: process.env.STRIPE_ANNUAL_PRICE_ID || process.env.STRIPE_YEARLY_PRICE_ID,
  };

  const priceId = priceMap[plan];
  if (!plan || !priceId) {
    throw new Error('A valid plan or priceId is required.');
  }

  return { priceId, plan };
}

async function getOrCreateStripeCustomer(uid: string, email: string | null | undefined) {
  const db = getDbHelper();
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  const userData = userSnap.exists ? (userSnap.data() as Record<string, unknown>) : {};

  const existingCustomerId =
    typeof userData.stripeCustomerId === 'string'
      ? userData.stripeCustomerId
      : typeof userData.customerId === 'string'
        ? userData.customerId
        : '';

  if (existingCustomerId) {
    return existingCustomerId;
  }

  if (!email) {
    throw new Error('A customer email is required to create a billing session.');
  }

  const stripe = createStripeClient();
  const customer = await stripe.customers.create({
    email,
    metadata: {
      firebaseUid: uid,
    },
  });

  await userRef.set(
    {
      stripeCustomerId: customer.id,
      customerId: customer.id,
      stripeCustomerEmail: email,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return customer.id;
}

export async function POST(request: Request) {
  const auth = await verifyRequestUser(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  const body = await readRequestBody(request);

  let priceResolution;
  try {
    priceResolution = resolvePriceId(body);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid checkout request.', 400);
  }

  if (typeof priceResolution.priceId !== 'string' || !priceResolution.priceId) {
    return jsonError('A valid priceId is required.', 400);
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return jsonError('Stripe is not configured.', 500);
  }

  const stripe = createStripeClient();
  const db = getDbHelper();

  try {
    const userRef = db.collection('users').doc(auth.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? (userSnap.data() as Record<string, unknown>) : {};
    const email = auth.decoded.email || (typeof userData.email === 'string' ? userData.email : null);
    const customerId = await getOrCreateStripeCustomer(auth.uid, email);

    const appUrl = getAppUrl(request);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceResolution.priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing?checkout=cancelled`,
      allow_promotion_codes: true,
      metadata: {
        userId: auth.uid,
        plan: priceResolution.plan ?? '',
      },
      subscription_data: {
        metadata: {
          userId: auth.uid,
          plan: priceResolution.plan ?? '',
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error('[stripe/checkout] session creation failed', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session.';
    const status = message.includes('customer email') || message.includes('priceId') ? 400 : 500;
    return jsonError(message, status);
  }
}