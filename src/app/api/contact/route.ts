import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import * as adminModule from '@/firebase/admin';

type RequestBody = Record<string, unknown>;

const MAX_BODY_BYTES = 25 * 1024;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 5000;
const DEDUPE_WINDOW_MS = 2 * 60 * 1000;

const recentSubmissions = new Map<string, number>();

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status });
}

function jsonError(error: string, status = 400) {
  return jsonResponse({ success: false, error }, status);
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
    // ignore malformed JSON here; validation happens below
  }

  return {};
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function validateEmail(email: string): boolean {
  if (!email || email.length > MAX_EMAIL_LENGTH) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getAllowedHostnames(request: Request): Set<string> {
  const hostnames = new Set<string>();
  const requestUrl = new URL(request.url);
  hostnames.add(requestUrl.host);

  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (publicSiteUrl) {
    try {
      hostnames.add(new URL(publicSiteUrl).host);
    } catch {
      // ignore invalid env values
    }
  }

  return hostnames;
}

function isAllowedOrigin(request: Request): boolean {
  const allowedHosts = getAllowedHostnames(request);
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  const candidates = [origin, referer].filter((value): value is string => Boolean(value));
  if (candidates.length === 0) {
    return true;
  }

  for (const candidate of candidates) {
    try {
      const candidateHost = new URL(candidate).host;
      if (allowedHosts.has(candidateHost)) {
        return true;
      }
    } catch {
      // ignore malformed origin/referrer values
    }
  }

  return false;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'unknown';
}

function pruneRecentSubmissions(now = Date.now()) {
  for (const [key, timestamp] of recentSubmissions.entries()) {
    if (now - timestamp > DEDUPE_WINDOW_MS) {
      recentSubmissions.delete(key);
    }
  }
}

function getDeduplicationKey(payload: {
  email: string;
  name: string;
  subject: string;
  message: string;
  ip: string;
}) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex');
}

function validateSubmission(body: RequestBody) {
  const name = normalizeString(body.name);
  const email = normalizeString(body.email);
  const subject = normalizeString(body.subject);
  const message = normalizeString(body.message);

  const honeypotFields = ['website', 'url', 'companyWebsite', 'company_website', 'homepage', 'phoneNumber'];
  for (const field of honeypotFields) {
    const value = normalizeString(body[field]);
    if (value) {
      throw new Error('Submission rejected.');
    }
  }

  if (!name || name.length < 2 || name.length > MAX_NAME_LENGTH) {
    throw new Error('Please provide your name.');
  }

  if (!validateEmail(email)) {
    throw new Error('Please provide a valid email address.');
  }

  if (subject.length > MAX_SUBJECT_LENGTH) {
    throw new Error('Subject is too long.');
  }

  if (!message || message.length < 10) {
    throw new Error('Message is too short.');
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error('Message is too long.');
  }

  return {
    name,
    email,
    subject,
    message,
  };
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonError('Request body is too large.', 413);
  }

  if (!isAllowedOrigin(request)) {
    return jsonError('Origin not allowed.', 403);
  }

  const body = await readRequestBody(request);

  let submission;
  try {
    submission = validateSubmission(body);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid form submission.', 400);
  }

  const ip = getClientIp(request);
  pruneRecentSubmissions();

  const dedupeKey = getDeduplicationKey({
    ...submission,
    ip,
  });

  const previousSubmission = recentSubmissions.get(dedupeKey);
  if (previousSubmission && Date.now() - previousSubmission < DEDUPE_WINDOW_MS) {
    return jsonError('Please wait before submitting the same message again.', 429);
  }

  recentSubmissions.set(dedupeKey, Date.now());

  try {
    const db = getDbHelper();
    const docRef = await db.collection('contactSubmissions').add({
      ...submission,
      ip,
      userAgent: request.headers.get('user-agent') || null,
      origin: request.headers.get('origin') || null,
      referer: request.headers.get('referer') || null,
      status: 'new',
      createdAt: new Date().toISOString(),
    });

    return jsonResponse({
      success: true,
      data: {
        id: docRef.id,
      },
    });
  } catch (error) {
    console.error('[contact] submission failed', error);
    recentSubmissions.delete(dedupeKey);
    return jsonError('Failed to submit message. Please try again later.', 500);
  }
}