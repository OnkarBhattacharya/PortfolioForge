import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const ContactInputSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(254),
  subject: z.string().max(120).optional(),
  message: z.string().min(10).max(5000),
  username: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/),
});

const MAX_BODY_BYTES = 25 * 1024;
const DEDUPE_WINDOW_MS = 2 * 60 * 1000;

const recentSubmissions = new Map<string, number>();

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status });
}

function jsonError(error: string, status = 400) {
  return jsonResponse({ success: false, error }, status);
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

function validateSubmission(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
  const email = typeof body.email === 'string' ? body.email.trim().replace(/\s+/g, ' ') : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim().replace(/\s+/g, ' ') : '';
  const message = typeof body.message === 'string' ? body.message.trim().replace(/\s+/g, ' ') : '';
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';

  const honeypotFields = ['website', 'url', 'companyWebsite', 'company_website', 'homepage', 'phoneNumber'];
  for (const field of honeypotFields) {
    const value = typeof body[field] === 'string' ? body[field].trim().replace(/\s+/g, ' ') : '';
    if (value) {
      throw new Error('Submission rejected.');
    }
  }

  if (!name || name.length < 2 || name.length > 80) {
    throw new Error('Please provide your name.');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error('Please provide a valid email address.');
  }

  if (subject.length > 120) {
    throw new Error('Subject is too long.');
  }

  if (!message || message.length < 10) {
    throw new Error('Message is too short.');
  }

  if (message.length > 5000) {
    throw new Error('Message is too long.');
  }

  if (!username || username.length < 3 || username.length > 30 || !/^[a-z0-9-]+$/.test(username)) {
    throw new Error('Invalid username.');
  }

  return { name, email, subject, message, username };
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

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonError('Request body is too large.', 413);
  }

  if (!isAllowedOrigin(request)) {
    return jsonError('Origin not allowed.', 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  let submission: { name: string; email: string; subject: string; message: string; username: string };
  try {
    submission = validateSubmission(body);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid form submission.', 400);
  }

  const ip = getClientIp(request);
  pruneRecentSubmissions();

  const crypto = await import('node:crypto');
  const dedupeKey = crypto
    .createHash('sha256')
    .update(JSON.stringify({ ...submission, ip }))
    .digest('hex');

  const previousSubmission = recentSubmissions.get(dedupeKey);
  if (previousSubmission && Date.now() - previousSubmission < DEDUPE_WINDOW_MS) {
    return jsonError('Please wait before submitting the same message again.', 429);
  }

  recentSubmissions.set(dedupeKey, Date.now());

  const supabase = await createClient();
  
  try {
    // Look up the user by username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', submission.username)
      .single();

    if (profileError || !profile) {
      recentSubmissions.delete(dedupeKey);
      return jsonError('Portfolio not found.', 404);
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: profile.id,
        sender_name: submission.name,
        sender_email: submission.email,
        subject: submission.subject || null,
        message: submission.message,
        read: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[contact] submission failed', error);
      recentSubmissions.delete(dedupeKey);
      return jsonError('Failed to submit message. Please try again later.', 500);
    }

    return jsonResponse({
      success: true,
      data: { id: data.id },
    });
  } catch (error) {
    console.error('[contact] submission failed', error);
    recentSubmissions.delete(dedupeKey);
    return jsonError('Failed to submit message. Please try again later.', 500);
  }
}