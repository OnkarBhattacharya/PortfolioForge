import { NextResponse } from 'next/server';
import * as adminModule from '@/firebase/admin';
import * as linkedinParserModule from '@/ai/flows/linkedin-parser';

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

function getFlowRunner(): (input: Record<string, unknown>) => Promise<unknown> {
  const mod = linkedinParserModule as Record<string, unknown>;
  const candidates = [
    mod.linkedinParserFlow,
    mod.parseLinkedInProfile,
    mod.parseLinkedinProfile,
    mod.linkedinParser,
    mod.default,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'function') {
      return candidate as (input: Record<string, unknown>) => Promise<unknown>;
    }
  }

  throw new Error('LinkedIn parser flow is unavailable.');
}

function normalizeProfileInput(body: RequestBody) {
  const profileUrlFields = ['profileUrl', 'linkedinUrl', 'url', 'profile'];
  const textFields = ['profileText', 'linkedinText', 'text', 'content'];

  let profileUrl: string | null = null;
  let profileText: string | null = null;

  for (const field of profileUrlFields) {
    const value = body[field];
    if (typeof value === 'string' && value.trim()) {
      profileUrl = value.trim();
      break;
    }
  }

  for (const field of textFields) {
    const value = body[field];
    if (typeof value === 'string' && value.trim()) {
      profileText = value.trim();
      break;
    }
  }

  if (!profileUrl && !profileText) {
    throw new Error('A LinkedIn profile URL or text content is required.');
  }

  if (profileUrl) {
    const normalized = new URL(profileUrl);
    if (normalized.protocol !== 'http:' && normalized.protocol !== 'https:') {
      throw new Error('Only HTTP and HTTPS profile URLs are allowed.');
    }

    const host = normalized.hostname.toLowerCase();
    if (!host.includes('linkedin.com') && !host.endsWith('.linkedin.com')) {
      throw new Error('LinkedIn profile URL must point to linkedin.com.');
    }

    profileUrl = normalized.toString();
  }

  return { profileUrl, profileText };
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

  let normalized;
  try {
    normalized = normalizeProfileInput(body);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body.', 400);
  }

  const runner = getFlowRunner();

  try {
    const data = await runner({
      ...body,
      userId: auth.uid,
      uid: auth.uid,
      ...normalized,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[linkedin-parser] import failed', error);
    return jsonError(error instanceof Error ? error.message : 'Failed to parse LinkedIn profile.', 500);
  }
}