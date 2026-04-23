import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_REDIRECTS = 5;
const MAX_RESPONSE_BYTES = 1_000_000;
const USER_AGENT = 'PortfolioForge-WebImporter/1.0';

export interface WebImporterInput {
  url?: string;
  urls?: string[];
  userId?: string;
  [key: string]: unknown;
}

export interface WebImporterPageContent {
  url: string;
  finalUrl: string;
  title: string | null;
  html: string;
  contentType: string | null;
  status: number;
  fetchedAt: string;
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

  if (normalized === '::1') return true;
  if (normalized.startsWith('fe80:') || normalized.startsWith('fe90:') || normalized.startsWith('fea0:') || normalized.startsWith('feb0:')) {
    return true;
  }
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true;
  }
  if (normalized === '::') return true;

  return false;
}

function isUnsafeHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();

  if (!lower) return true;
  if (lower === 'localhost' || lower.endsWith('.localhost')) return true;
  if (lower === 'metadata.google.internal' || lower.endsWith('.metadata.google.internal')) return true;
  if (lower.endsWith('.local') || lower.endsWith('.internal')) return true;
  if (lower === '0.0.0.0' || lower === '::' || lower === '::1') return true;
  if (lower === '169.254.169.254') return true;

  if (isIP(lower) === 4) return isPrivateIPv4(lower);
  if (isIP(lower) === 6) return isPrivateIPv6(lower);

  return false;
}

async function assertSafeUrl(rawUrl: string): Promise<URL> {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS URLs are allowed.');
  }

  if (url.username || url.password) {
    throw new Error('URLs with credentials are not allowed.');
  }

  if (!url.hostname) {
    throw new Error('URL hostname is required.');
  }

  if (isUnsafeHostname(url.hostname)) {
    throw new Error('Unsafe destination blocked.');
  }

  try {
    const records = await lookup(url.hostname, { all: true, verbatim: true });
    if (records.some((record) => isUnsafeHostname(record.address))) {
      throw new Error('Unsafe destination blocked.');
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unsafe destination blocked.') {
      throw error;
    }

    throw new Error('Unable to resolve destination safely.');
  }

  return url;
}

function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleMatch?.[1]) return null;

  return titleMatch[1].replace(/\s+/g, ' ').trim() || null;
}

async function fetchSafeHtml(rawUrl: string, redirectCount = 0): Promise<WebImporterPageContent> {
  const url = await assertSafeUrl(rawUrl);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      'User-Agent': USER_AGENT,
    },
    redirect: 'manual',
  });

  if (response.status >= 300 && response.status < 400) {
    if (redirectCount >= MAX_REDIRECTS) {
      throw new Error('Too many redirects.');
    }

    const location = response.headers.get('location');
    if (!location) {
      throw new Error('Redirect response is missing a location header.');
    }

    const nextUrl = new URL(location, url);
    return fetchSafeHtml(nextUrl.toString(), redirectCount + 1);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url.hostname}.`);
  }

  const contentType = response.headers.get('content-type');
  const contentLength = Number(response.headers.get('content-length') ?? '0');

  if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
    throw new Error('Response is too large.');
  }

  const html = await response.text();

  if (html.length > MAX_RESPONSE_BYTES) {
    throw new Error('Response is too large.');
  }

  return {
    url: rawUrl,
    finalUrl: response.url || url.toString(),
    title: extractTitle(html),
    html,
    contentType,
    status: response.status,
    fetchedAt: new Date().toISOString(),
  };
}

function normalizeInputUrls(input: WebImporterInput): string[] {
  const candidates: string[] = [];

  if (typeof input.url === 'string' && input.url.trim()) {
    candidates.push(input.url.trim());
  }

  if (Array.isArray(input.urls)) {
    for (const value of input.urls) {
      if (typeof value === 'string' && value.trim()) {
        candidates.push(value.trim());
      }
    }
  }

  return Array.from(new Set(candidates));
}

export async function webImporterFlow(input: WebImporterInput): Promise<WebImporterPageContent | WebImporterPageContent[]> {
  const urls = normalizeInputUrls(input);

  if (urls.length === 0) {
    throw new Error('At least one URL is required.');
  }

  if (urls.length === 1) {
    return fetchSafeHtml(urls[0]);
  }

  const results: WebImporterPageContent[] = [];
  for (const url of urls) {
    results.push(await fetchSafeHtml(url));
  }

  return results;
}

export const webImporter = webImporterFlow;
export const importWebsiteData = webImporterFlow;
export const fetchWebsiteContent = webImporterFlow;
export default webImporterFlow;