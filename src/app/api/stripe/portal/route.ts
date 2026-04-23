import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import * as adminModule from '@/firebase/admin';

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

export async function POST(request: Request) {
  const auth = await verifyRequestUser(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return jsonError('Stripe is not configured.', 500);
  }

  try {
    const db = getDbHelper();
    const userSnap = await db.collection('users').doc(auth.uid).get();

    if (!userSnap.exists) {
      return jsonError('No billing profile found for this account.', 404);
    }

    const userData = userSnap.data() as Record<string, unknown>;
    const customerId =
      typeof userData.stripeCustomerId === 'string'
        ? userData.stripeCustomerId
        : typeof userData.customerId === 'string'
          ? userData.customerId
          : '';

    if (!customerId) {
      return jsonError('No Stripe customer has been created for this account yet.', 404);
    }

    const stripe = createStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getAppUrl(request)}/billing`,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: session.url,
      },
    });
  } catch (error) {
    console.error('[stripe/portal] session creation failed', error);
    const message = error instanceof Error ? error.message : 'Failed to create billing portal session.';
    const status = message.includes('customer') ? 404 : 500;
    return jsonError(message, status);
  }
}