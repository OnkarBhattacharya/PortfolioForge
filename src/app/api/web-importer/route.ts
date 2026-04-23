import { NextResponse } from 'next/server';
import { isIP } from 'node:net';
import * as adminModule from '@/firebase/admin';
import * as webImporterModule from '@/ai/flows/web-importer';

const MAX_URLS = 5;

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

function formDataToObject(formData: FormData): RequestBody {
  const result: RequestBody = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const existing = result[key];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else if (existing !== undefined) {
        result[key] = [existing, value];
      } else {
        result[key] = value;
      }
      continue;
    }

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

async function readRequestBody(request: Request): Promise<RequestBody> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    return formDataToObject(await request.formData());
  }

  try {
    const json = await request.json();
    if (json && typeof json === 'object' && !Array.isArray(json)) {
      return json as RequestBody;
    }
  } catch {
    // fall through to empty object
  }

  return {};
}

function isPrivateIPv4(address: string): boolean {
  const octets = address.split('.').map((part) => Number(part));
  if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)) {
    return true;
  }

  const [a, b] = octets;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;

  return false;
}

function isPrivateIPv6(address: string): boolean {
  const normalized = address.toLowerCase();
  return (
    normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('fe80:') ||
    normalized.startsWith('fe90:') ||
    normalized.startsWith('fea0:') ||
    normalized.startsWith('feb0:') ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd')
  );
}

function validateUrlValue(value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error('One or more URLs are invalid.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS URLs are allowed.');
  }

  if (url.username || url.password) {
    throw new Error('URLs with credentials are not allowed.');
  }

  const hostname = url.hostname.toLowerCase();
  if (!hostname) {
    throw new Error('One or more URLs are invalid.');
  }

  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === 'metadata.google.internal' ||
    hostname.endsWith('.metadata.google.internal') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === '169.254.169.254' ||
    hostname === '0.0.0.0' ||
    hostname === '::' ||
    hostname === '::1'
  ) {
    throw new Error('Unsafe destination blocked.');
  }

  if (isIP(hostname) === 4 && isPrivateIPv4(hostname)) {
    throw new Error('Unsafe destination blocked.');
  }

  if (isIP(hostname) === 6 && isPrivateIPv6(hostname)) {
    throw new Error('Unsafe destination blocked.');
  }

  return url.toString();
}

function getWebImporterRunner(): (input: Record<string, unknown>) => Promise<unknown> {
  const mod = webImporterModule as Record<string, unknown>;
  const candidates = [
    mod.webImporterFlow,
    mod.webImporter,
    mod.importWebsiteData,
    mod.fetchWebsiteContent,
    mod.default,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'function') {
      return candidate as (input: Record<string, unknown>) => Promise<unknown>;
    }
  }

  throw new Error('Web importer flow is unavailable.');
}

function normalizeUrls(body: RequestBody): string[] {
  const candidates = new Set<string>();

  const singleUrlFields = ['url', 'websiteUrl', 'sourceUrl', 'targetUrl'];
  for (const field of singleUrlFields) {
    const value = body[field];
    if (typeof value === 'string' && value.trim()) {
      candidates.add(validateUrlValue(value.trim()));
    }
  }

  const arrayFields = ['urls', 'websiteUrls', 'sourceUrls'];
  for (const field of arrayFields) {
    const value = body[field];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.trim()) {
          candidates.add(validateUrlValue(item.trim()));
        }
      }
    }
  }

  const urls = Array.from(candidates);
  if (urls.length === 0) {
    throw new Error('A URL is required.');
  }

  if (urls.length > MAX_URLS) {
    throw new Error(`No more than ${MAX_URLS} URLs can be imported at once.`);
  }

  return urls;
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

  let urls: string[];
  try {
    urls = normalizeUrls(body);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body.', 400);
  }

  const runner = getWebImporterRunner();

  try {
    const data = await runner({
      ...body,
      userId: auth.uid,
      uid: auth.uid,
      urls,
      url: urls[0],
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[web-importer] import failed', error);
    return jsonError(error instanceof Error ? error.message : 'Failed to import website content.', 500);
  }
}