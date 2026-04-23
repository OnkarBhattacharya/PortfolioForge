import { NextResponse } from 'next/server';
import * as adminModule from '@/firebase/admin';
import * as githubImporterModule from '@/ai/flows/github-importer';

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
  const mod = githubImporterModule as Record<string, unknown>;
  const candidates = [
    mod.githubImporterFlow,
    mod.importGitHubData,
    mod.importGithubData,
    mod.githubImporter,
    mod.default,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'function') {
      return candidate as (input: Record<string, unknown>) => Promise<unknown>;
    }
  }

  throw new Error('GitHub importer flow is unavailable.');
}

function normalizeGitHubUsername(rawValue: unknown): string | null {
  if (typeof rawValue !== 'string') {
    return null;
  }

  const value = rawValue.trim();
  if (!value) return null;

  const urlPattern = /^https?:\/\/(www\.)?github\.com\/([^/?#]+)(?:[/?#].*)?$/i;
  const urlMatch = value.match(urlPattern);
  const username = urlMatch ? urlMatch[2] : value.replace(/^@/, '');

  if (!/^[a-z\d](?:[a-z\d-]{0,38}[a-z\d])?$/i.test(username)) {
    return null;
  }

  return username;
}

function normalizeRepositoryIdentifier(rawValue: unknown): string | null {
  if (typeof rawValue !== 'string') {
    return null;
  }

  const value = rawValue.trim();
  if (!value) return null;

  if (/^[a-z\d_.-]+\/[a-z\d_.-]+$/i.test(value)) {
    return value;
  }

  const urlPattern = /^https?:\/\/(www\.)?github\.com\/([a-z\d_.-]+)\/([a-z\d_.-]+)(?:\.git)?(?:[/?#].*)?$/i;
  const urlMatch = value.match(urlPattern);
  if (urlMatch) {
    return `${urlMatch[2]}/${urlMatch[3]}`;
  }

  return null;
}

function normalizeGitHubPayload(body: RequestBody) {
  const usernameFields = ['username', 'githubUsername', 'profile', 'profileUrl', 'githubUrl'];
  let username: string | null = null;

  for (const field of usernameFields) {
    username = normalizeGitHubUsername(body[field]);
    if (username) break;
  }

  const repositoryFields = ['repositories', 'repoUrls', 'repositoryUrls', 'repoIdentifiers'];
  const repositories = new Set<string>();

  for (const field of repositoryFields) {
    const value = body[field];
    if (!Array.isArray(value)) continue;

    for (const item of value) {
      const normalized = normalizeRepositoryIdentifier(item);
      if (!normalized) {
        throw new Error('One or more repository values are invalid.');
      }
      repositories.add(normalized);
    }
  }

  if (!username && repositories.size === 0) {
    throw new Error('A GitHub username or repository list is required.');
  }

  const normalized = {
    username,
    repositories: Array.from(repositories),
  };

  return normalized;
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
    normalized = normalizeGitHubPayload(body);
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
    console.error('[github-importer] import failed', error);
    return jsonError(error instanceof Error ? error.message : 'Failed to import GitHub data.', 500);
  }
}