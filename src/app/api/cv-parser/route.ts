import { NextResponse } from 'next/server';
import * as adminModule from '@/firebase/admin';
import * as cvParserModule from '@/ai/flows/cv-parser';

const MAX_FILE_BYTES = 2 * 1024 * 1024;

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
    const existing = result[key];

    if (Array.isArray(existing)) {
      existing.push(value);
      continue;
    }

    if (existing !== undefined) {
      result[key] = [existing, value];
      continue;
    }

    result[key] = value;
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
    // fall through
  }

  return {};
}

function getFlowRunner(): (input: Record<string, unknown>) => Promise<unknown> {
  const mod = cvParserModule as Record<string, unknown>;
  const candidates = [
    mod.cvParserFlow,
    mod.parseCv,
    mod.parseResume,
    mod.resumeParser,
    mod.default,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'function') {
      return candidate as (input: Record<string, unknown>) => Promise<unknown>;
    }
  }

  throw new Error('CV parser flow is unavailable.');
}

function getTextValue(body: RequestBody): string | null {
  const textFields = ['resumeText', 'cvText', 'text', 'content', 'documentText', 'parsedText'];

  for (const field of textFields) {
    const value = body[field];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getUploadedFile(body: RequestBody): File | null {
  const fileFields = ['file', 'resumeFile', 'cvFile', 'document', 'upload'];

  for (const field of fileFields) {
    const value = body[field];
    if (value instanceof File) {
      return value;
    }
    if (Array.isArray(value)) {
      const match = value.find((item) => item instanceof File);
      if (match instanceof File) {
        return match;
      }
    }
  }

  for (const value of Object.values(body)) {
    if (value instanceof File) {
      return value;
    }
  }

  return null;
}

function pickPayload(body: RequestBody, uid: string, text: string | null, file: File | null) {
  return {
    ...body,
    userId: uid,
    uid,
    resumeText: text ?? undefined,
    cvText: text ?? undefined,
    fileName: file?.name,
    fileType: file?.type,
  };
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

  const file = getUploadedFile(body);
  const text = getTextValue(body);

  if (!file && !text) {
    return jsonError('A CV file or text content is required.', 400);
  }

  let fileText: string | null = null;
  if (file) {
    if (file.size > MAX_FILE_BYTES) {
      return jsonError('Uploaded file is too large.', 413);
    }

    try {
      fileText = (await file.text()).trim() || null;
    } catch {
      return jsonError('Unable to read uploaded file.', 400);
    }
  }

  const payload = pickPayload(body, auth.uid, text ?? fileText, file);
  const runner = getFlowRunner();

  try {
    const data = await runner(payload);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[cv-parser] parse failed', error);
    return jsonError(error instanceof Error ? error.message : 'Failed to parse CV.', 500);
  }
}