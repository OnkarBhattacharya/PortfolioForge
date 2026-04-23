import { NextResponse } from 'next/server';
import * as adminModule from '@/firebase/admin';

const COLLECTION_NAME = 'portfolio-items';
const FREE_PLAN_ITEM_LIMIT = 3;

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
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const result: RequestBody = {};

    for (const [key, value] of formData.entries()) {
      const existing = result[key];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else if (existing !== undefined) {
        result[key] = [existing, value];
      } else {
        result[key] = value;
      }
    }

    return result;
  }

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

function extractItemPayload(body: RequestBody): RequestBody {
  const candidateFields = ['item', 'portfolioItem', 'data'];
  for (const field of candidateFields) {
    const value = body[field];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as RequestBody;
    }
  }

  const payload: RequestBody = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === 'userId' || key === 'uid' || key === 'id' || key === 'createdAt' || key === 'updatedAt') {
      continue;
    }

    if (key === 'item' || key === 'portfolioItem' || key === 'data') {
      continue;
    }

    payload[key] = value;
  }

  return payload;
}

function normalizeStoredItem(payload: RequestBody, uid: string, itemId?: string) {
  return {
    ...payload,
    id: itemId ?? typeof payload.id === 'string' ? payload.id : undefined,
    userId: uid,
    uid,
    createdAt: typeof payload.createdAt === 'string' ? payload.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function isPaidPlan(userData: Record<string, unknown> | null | undefined): boolean {
  if (!userData) return false;

  const subscriptionStatus = String(userData.subscriptionStatus ?? userData.stripeSubscriptionStatus ?? '').toLowerCase();
  if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
    return true;
  }

  const plan = String(userData.plan ?? userData.billingPlan ?? userData.tier ?? '').toLowerCase();
  return Boolean(plan && plan !== 'free' && plan !== 'trial');
}

async function readUserPlan(uid: string) {
  const db = getDbHelper();
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? (doc.data() as Record<string, unknown>) : null;
}

async function getItemsForUser(uid: string) {
  const db = getDbHelper();
  const snapshot = await db.collection(COLLECTION_NAME).where('userId', '==', uid).get();
  const items = snapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => ({
    id: doc.id,
    ...doc.data(),
  }));

  items.sort((left, right) => {
    const leftTime = String((left as Record<string, unknown>).createdAt ?? '');
    const rightTime = String((right as Record<string, unknown>).createdAt ?? '');
    return rightTime.localeCompare(leftTime);
  });

  return items;
}

async function createItem(uid: string, body: RequestBody) {
  const db = getDbHelper();
  const payload = extractItemPayload(body);

  if (!payload || Object.keys(payload).length === 0) {
    throw new Error('Portfolio item payload is required.');
  }

  const userData = await readUserPlan(uid);
  const hasPaidPlan = isPaidPlan(userData);

  if (hasPaidPlan) {
    const docRef = db.collection(COLLECTION_NAME).doc();
    const item = normalizeStoredItem(payload, uid, docRef.id);

    await docRef.set(item);
    return item;
  }

  return db.runTransaction(async (transaction: { get: (ref: unknown) => Promise<{ empty: boolean; size: number; docs: Array<{ id: string; data: () => Record<string, unknown> }> }>; set: (ref: { id: string }, data: Record<string, unknown>) => void; }) => {
    const collectionQuery = db.collection(COLLECTION_NAME).where('userId', '==', uid);
    const snapshot = await transaction.get(collectionQuery);

    if (!snapshot.empty && snapshot.size >= FREE_PLAN_ITEM_LIMIT) {
      throw new Error(`Free plans are limited to ${FREE_PLAN_ITEM_LIMIT} portfolio items.`);
    }

    const docRef = db.collection(COLLECTION_NAME).doc();
    const item = normalizeStoredItem(payload, uid, docRef.id);

    transaction.set(docRef, item);
    return item;
  });
}

export async function GET(request: Request) {
  const auth = await verifyRequestUser(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  const requestUserId = new URL(request.url).searchParams.get('userId');
  if (requestUserId && requestUserId !== auth.uid) {
    return jsonError('Forbidden.', 403);
  }

  try {
    const data = await getItemsForUser(auth.uid);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[portfolio-items] list failed', error);
    return jsonError('Failed to load portfolio items.', 500);
  }
}

export async function POST(request: Request) {
  const auth = await verifyRequestUser(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  const body = await readRequestBody(request);
  const bodyUserId = typeof body.userId === 'string' ? body.userId.trim() : '';
  if (bodyUserId && bodyUserId !== auth.uid) {
    return jsonError('Forbidden.', 403);
  }

  try {
    const data = await createItem(auth.uid, body);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create portfolio item.';
    const status = message.includes('limited') ? 403 : 400;
    return jsonError(message, status);
  }
}