# PortfolioForge Migration Plan: Firebase + Genkit → Next.js + Supabase + OpenRouter

## Executive Summary

This document provides a complete migration plan for PortfolioForge from its current Firebase + Genkit architecture to a modern, cost-effective Next.js + Supabase + OpenRouter stack. The migration preserves all existing functionality while eliminating vendor lock-in and paid AI dependencies.

---

## 1. Feature-by-Feature Migration Map

| Feature | Current Implementation | New Implementation |
|---------|------------------------|-------------------|
| **Authentication** | Firebase Auth (Google, Apple, email/password, anonymous) | Supabase Auth (same providers + magic links) |
| **User Profiles** | Firestore `/users/{userId}` | Supabase `profiles` table with RLS |
| **Portfolio Items** | Firestore `/users/{userId}/portfolioItems/{itemId}` | Supabase `portfolio_items` table with RLS |
| **Themes** | Firestore `/themes/{themeId}` | Supabase `themes` table (public read) |
| **Contact Messages** | Firestore `/users/{userId}/messages/{messageId}` | Supabase `messages` table with RLS |
| **File Storage** | Firebase Storage | Supabase Storage |
| **AI: CV Parsing** | Genkit + Google Gemini (multimodal) | OpenRouter free models (Llama 3.2 Vision, etc.) |
| **AI: LinkedIn Parsing** | Genkit + Google Gemini | OpenRouter free models (Llama 3.1, etc.) |
| **AI: GitHub Import** | Genkit + GitHub API + Genkit | Direct GitHub API + OpenRouter for summarization |
| **AI: Web Import** | Genkit + custom fetch + Genkit | Direct fetch + OpenRouter for extraction |
| **AI: Content Suggestions** | Genkit + Google Gemini | OpenRouter free models |
| **AI: Theme Generation** | Genkit + Google Gemini | OpenRouter free models |
| **AI: Translation** | Genkit + Google Gemini | OpenRouter free models |
| **AI: README Summarization** | Genkit + Google Gemini | OpenRouter free models |
| **Billing** | Stripe + Firebase Admin | Stripe + Supabase service role |
| **Admin Dashboard** | Firestore admin list | Supabase admin queries with service role |
| **Public Portfolios** | Next.js + Firestore | Next.js + Supabase (SSR/ISR) |

---

## 2. Supabase Schema Plan

### 2.1 Core Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  headline TEXT,
  bio TEXT,
  avatar_url TEXT,
  links JSONB DEFAULT '{}', -- { github, linkedin, twitter, website }
  skills TEXT[] DEFAULT '{}',
  theme_id TEXT DEFAULT 'minimal',
  custom_theme JSONB,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'studio')),
  subscription_status TEXT DEFAULT 'inactive',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Items
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_md TEXT,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  project_url TEXT,
  repo_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Themes (static seed data)
CREATE TABLE themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  css_vars JSONB NOT NULL,
  preview_image_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE
);

-- Contact Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Usage Tracking (for rate limiting)
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- 'cv_parse', 'linkedin_parse', 'github_import', etc.
  model TEXT NOT NULL,
  tokens_in INT DEFAULT 0,
  tokens_out INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portfolio_items_user_id ON portfolio_items(user_id);
CREATE INDEX idx_portfolio_items_featured ON portfolio_items(user_id, featured) WHERE featured;
CREATE INDEX idx_portfolio_items_sort ON portfolio_items(user_id, sort_order);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_ai_usage_user_date ON ai_usage(user_id, created_at DESC);
```

### 2.2 RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_owner_write" ON profiles FOR ALL USING (auth.uid() = id);

-- Portfolio Items: public read, owner write
CREATE POLICY "portfolio_public_read" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "portfolio_owner_write" ON portfolio_items FOR ALL USING (auth.uid() = user_id);

-- Themes: public read only
CREATE POLICY "themes_public_read" ON themes FOR SELECT USING (true);

-- Messages: owner read only
CREATE POLICY "messages_owner_read" ON messages FOR SELECT USING (auth.uid() = user_id);

-- AI Usage: owner read only
CREATE POLICY "ai_usage_owner_read" ON ai_usage FOR SELECT USING (auth.uid() = user_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 3. Auth + RLS Plan

### 3.1 Supabase Auth Configuration

| Provider | Configuration |
|----------|---------------|
| Email/Password | Enabled |
| Google OAuth | Enabled (via Supabase dashboard) |
| Apple OAuth | Enabled (via Supabase dashboard) |
| GitHub OAuth | Enabled (for GitHub import flow) |
| Magic Links | Enabled (passwordless option) |

### 3.2 Auth Flow

1. **Signup**: User signs up via Supabase Auth → trigger creates profile row
2. **Login**: Supabase Auth handles session → JWT in cookie
3. **Session**: Server-side validation via `supabase.auth.getUser()`
4. **Profile Creation**: Database trigger on `auth.users` insert creates profile

```sql
-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email, role)
  VALUES (
    NEW.id,
    'user_' || substr(NEW.id::text, 1, 8),
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 4. AI Strategy Using Free OpenRouter Models

### 4.1 OpenRouter Free Models (as of 2024)

| Use Case | Primary Model | Fallback Model |
|----------|---------------|----------------|
| CV Parsing (Vision) | `meta-llama/llama-3.2-11b-vision-instruct:free` | `google/gemma-2-9b-it:free` |
| LinkedIn Parsing | `meta-llama/llama-3.1-8b-instruct:free` | `microsoft/phi-3-mini-128k-instruct:free` |
| GitHub README Summary | `meta-llama/llama-3.1-8b-instruct:free` | `microsoft/phi-3-mini-128k-instruct:free` |
| Web Import/Extraction | `meta-llama/llama-3.1-8b-instruct:free` | `microsoft/phi-3-mini-128k-instruct:free` |
| Content Suggestions | `meta-llama/llama-3.1-8b-instruct:free` | `google/gemma-2-9b-it:free` |
| Theme Generation | `meta-llama/llama-3.1-8b-instruct:free` | `google/gemma-2-9b-it:free` |
| Translation | `meta-llama/llama-3.1-8b-instruct:free` | `google/gemma-2-9b-it:free` |
| README Summarization | `meta-llama/llama-3.1-8b-instruct:free` | `microsoft/phi-3-mini-128k-instruct:free` |

### 4.2 AI Service Abstraction Layer

```typescript
// lib/ai/openrouter.ts
import OpenAI from 'openai';
import { z } from 'zod';
import { CvDataSchema, ThemeConfigSchema } from '@/lib/schemas';

const FREE_MODELS = {
  VISION: 'meta-llama/llama-3.2-11b-vision-instruct:free',
  TEXT: 'meta-llama/llama-3.1-8b-instruct:free',
  LONG_CONTEXT: 'microsoft/phi-3-mini-128k-instruct:free',
  CREATIVE: 'google/gemma-2-9b-it:free',
} as const;

export class OpenRouterAI {
  private client: OpenAI;
  private rateLimiter: Map<string, { count: number; resetAt: number }> = new Map();

  constructor() {
    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL!,
        'X-Title': 'PortfolioForge',
      },
    });
  }

  private async checkRateLimit(userId: string, feature: string): Promise<boolean> {
    const key = `${userId}:${feature}`;
    const now = Date.now();
    const limit = this.rateLimiter.get(key);

    if (!limit || now > limit.resetAt) {
      this.rateLimiter.set(key, { count: 1, resetAt: now + 60000 }); // 1/min
      return true;
    }

    if (limit.count >= 10) return false; // 10/min per feature
    limit.count++;
    return true;
  }

  private async callModel<T>({
    model,
    messages,
    responseSchema,
    maxTokens = 2000,
    temperature = 0.3,
  }: {
    model: string;
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    responseSchema: z.ZodSchema<T>;
    maxTokens?: number;
    temperature?: number;
  }): Promise<T> {
    const completion = await this.client.chat.completions.create({
      model,
      messages,
      response_format: { type: 'json_object' },
      max_tokens: maxTokens,
      temperature,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = JSON.parse(content);
    return responseSchema.parse(parsed);
  }

  // CV Parsing (Vision)
  async parseCV(userId: string, cvBase64: string, mimeType: string): Promise<z.infer<typeof CvDataSchema>> {
    if (!(await this.checkRateLimit(userId, 'cv_parse'))) {
      throw new Error('Rate limit exceeded for CV parsing');
    }

    return this.callModel({
      model: FREE_MODELS.VISION,
      messages: [
        { role: 'system', content: CV_PARSE_PROMPT },
        { role: 'user', content: [{ type: 'image_url', image_url: { url: `data:${mimeType};base64,${cvBase64}` } }] },
      ],
      responseSchema: CvDataSchema,
      maxTokens: 3000,
    });
  }

  // LinkedIn Parsing
  async parseLinkedIn(userId: string, text: string): Promise<z.infer<typeof CvDataSchema>> {
    if (!(await this.checkRateLimit(userId, 'linkedin_parse'))) {
      throw new Error('Rate limit exceeded for LinkedIn parsing');
    }

    return this.callModel({
      model: FREE_MODELS.TEXT,
      messages: [
        { role: 'system', content: LINKEDIN_PARSE_PROMPT },
        { role: 'user', content: text },
      ],
      responseSchema: CvDataSchema,
      maxTokens: 3000,
    });
  }

  // GitHub Import
  async importGitHub(userId: string, repos: GithubRepo[]): Promise<{ repos: PortfolioRepo[] }> {
    if (!(await this.checkRateLimit(userId, 'github_import'))) {
      throw new Error('Rate limit exceeded for GitHub import');
    }

    const repoText = repos.map(r => `${r.name}: ${r.description || 'No description'} (${r.language || 'Unknown'}) - ${r.html_url}`).join('\n');
    return this.callModel({
      model: FREE_MODELS.TEXT,
      messages: [
        { role: 'system', content: GITHUB_IMPORT_PROMPT },
        { role: 'user', content: repoText },
      ],
      responseSchema: z.object({ repos: z.array(GithubRepositorySchema) }),
    });
  }

  // Web Import
  async importWeb(userId: string, url: string, html: string): Promise<WebImportResult> {
    if (!(await this.checkRateLimit(userId, 'web_import'))) {
      throw new Error('Rate limit exceeded for web import');
    }

    return this.callModel({
      model: FREE_MODELS.LONG_CONTEXT,
      messages: [
        { role: 'system', content: WEB_IMPORT_PROMPT },
        { role: 'user', content: `URL: ${url}\n\nHTML:\n${html.slice(0, 15000)}` },
      ],
      responseSchema: WebImportSchema,
    });
  }

  // Content Suggestions
  async suggestContent(userId: string, input: ContentSuggestInput): Promise<ContentSuggestions> {
    if (!(await this.checkRateLimit(userId, 'content_suggest'))) {
      throw new Error('Rate limit exceeded for content suggestions');
    }

    return this.callModel({
      model: FREE_MODELS.CREATIVE,
      messages: [
        { role: 'system', content: CONTENT_SUGGEST_PROMPT },
        { role: 'user', content: JSON.stringify(input) },
      ],
      responseSchema: ContentSuggestionsSchema,
    });
  }

  // Theme Generation
  async generateTheme(userId: string, prompt: string): Promise<z.infer<typeof ThemeConfigSchema>> {
    if (!(await this.checkRateLimit(userId, 'theme_gen'))) {
      throw new Error('Rate limit exceeded for theme generation');
    }

    return this.callModel({
      model: FREE_MODELS.CREATIVE,
      messages: [
        { role: 'system', content: THEME_GEN_PROMPT },
        { role: 'user', content: prompt },
      ],
      responseSchema: ThemeConfigSchema,
    });
  }

  // Translation
  async translate(userId: string, texts: string[], targetLanguage: string): Promise<string[]> {
    if (!(await this.checkRateLimit(userId, 'translate'))) {
      throw new Error('Rate limit exceeded for translation');
    }

    return this.callModel({
      model: FREE_MODELS.TEXT,
      messages: [
        { role: 'system', content: TRANSLATE_PROMPT(targetLanguage) },
        { role: 'user', content: JSON.stringify(texts) },
      ],
      responseSchema: z.object({ translations: z.array(z.string()) }),
    });
  }

  // README Summarization
  async summarizeReadme(userId: string, readme: string): Promise<string> {
    if (!(await this.checkRateLimit(userId, 'readme_summary'))) {
      throw new Error('Rate limit exceeded for README summarization');
    }

    const result = await this.callModel({
      model: FREE_MODELS.TEXT,
      messages: [
        { role: 'system', content: README_SUMMARY_PROMPT },
        { role: 'user', content: readme.slice(0, 10000) },
      ],
      responseSchema: z.string(),
      maxTokens: 200,
    });

    return result as unknown as string;
  }
}

// Prompts (abbreviated - full versions in actual implementation)
const CV_PARSE_PROMPT = `You are an expert document analyst. Parse the CV/Resume and extract structured data...`;
const LINKEDIN_PARSE_PROMPT = `You are an expert data analyst specializing in professional profiles...`;
const GITHUB_IMPORT_PROMPT = `You are a GitHub repository analyzer...`;
const WEB_IMPORT_PROMPT = `You are a web content analyzer...`;
const CONTENT_SUGGEST_PROMPT = `You are an expert career coach and copywriter...`;
const THEME_GEN_PROMPT = `You are an expert UI/UX designer...`;
const README_SUMMARY_PROMPT = `You are an expert technical writer...`;
const TRANSLATE_PROMPT = (lang: string) => `You are a professional translator. Translate to ${lang}...`;
```

---

## 5. Backend/API Plan

### 5.1 API Route Structure (Next.js App Router)

```
/app/api/
├── auth/
│   └── callback/route.ts          # Supabase OAuth callback
├── profile/
│   ├── route.ts                   # GET/PUT profile
│   └── check-username/route.ts    # Check username availability
├── portfolio-items/
│   ├── route.ts                   # GET/POST items
│   └── [id]/route.ts              # GET/PUT/DELETE item
│   └── reorder/route.ts           # POST reorder items
├── themes/
│   └── route.ts                   # GET themes
├── ai/
│   ├── cv-parse/route.ts          # POST parse CV
│   ├── linkedin-parse/route.ts    # POST parse LinkedIn
│   ├── github-import/route.ts     # POST import GitHub
│   ├── web-import/route.ts        # POST import web URL
│   ├── content-suggest/route.ts   # POST content suggestions
│   ├── theme-generate/route.ts    # POST generate theme
│   ├── translate/route.ts         # POST translate
│   └── readme-summary/route.ts    # POST summarize README
├── stripe/
│   ├── checkout/route.ts          # POST create checkout
│   ├── portal/route.ts            # POST billing portal
│   └── webhook/route.ts           # POST Stripe webhook
└── upload/
    └── route.ts                   # POST signed upload URLs
```

### 5.2 Middleware (auth protection)

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/settings', '/import', '/ai-assistant', '/billing'];
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some(r => pathname.startsWith(r));

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/import/:path*', '/ai-assistant/:path*', '/billing/:path*', '/login', '/signup'],
};
```

---

## 6. Premium Subscription Gating Plan

### 6.1 Plan Tiers

| Feature | Free | Pro ($12/mo) | Studio ($29/mo) |
|---------|------|--------------|-----------------|
| Portfolio Items | 3 | Unlimited | Unlimited |
| Custom Domain | ❌ | ✅ | ✅ |
| Premium Themes | ❌ | ✅ | ✅ |
| Custom Theme | ❌ | ✅ | ✅ |
| Remove Branding | ❌ | ✅ | ✅ |
| AI Usage/Day | 10 | 100 | 500 |
| Custom Domain SSL | ❌ | ✅ | ✅ |
| Analytics | ❌ | Basic | Advanced |
| Team Members | ❌ | ❌ | 5 |

### 6.2 Server-Side Enforcement

```typescript
// lib/entitlements.ts
export async function checkEntitlement(userId: string, feature: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', userId)
    .single();

  if (!profile || profile.subscription_status !== 'active') return false;

  const tier = profile.subscription_tier;
  const limits: Record<string, Record<string, number>> = {
    portfolio_items: { free: 3, pro: -1, studio: -1 },
    ai_daily: { free: 10, pro: 100, studio: 500 },
    custom_domain: { free: 0, pro: 1, studio: 5 },
  };

  const limit = limits[feature]?.[tier] ?? 0;
  if (limit === -1) return true;

  // Check current usage
  const { count } = await supabase
    .from(feature === 'portfolio_items' ? 'portfolio_items' : 'ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 86400000).toISOString());

  return (count ?? 0) < limit;
}
```

### 6.3 Stripe Integration

- **Checkout**: Creates Stripe Checkout Session with `metadata.userId`
- **Portal**: Creates Billing Portal Session for customer self-service
- **Webhook**: Updates `profiles` table with subscription status

---

## 7. Deployment Plan

### 7.1 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# OpenRouter
OPENROUTER_API_KEY=sk-or-xxx

# App
NEXT_PUBLIC_APP_URL=https://portfolioforge.com

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_STUDIO_MONTHLY=price_xxx

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXX
```

### 7.2 Vercel Deployment

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 7.3 Supabase Configuration

1. Create Supabase project
2. Run schema migration
3. Enable Auth providers (Google, Apple, GitHub)
4. Configure Storage buckets: `portfolio-images`, `cv-uploads`
5. Set up Storage policies
6. Add Stripe webhook URL in Stripe dashboard

---

## 8. Production Risk Assessment & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OpenRouter free model unavailable | Medium | High | Multi-model fallback chain; cached responses; graceful degradation |
| OpenRouter rate limits | High | Medium | Client + server rate limiting; queue with exponential backoff |
| Supabase free tier limits | Low | High | Monitor usage; alert at 70%; upgrade path documented |
| AI output quality variance | High | Medium | Structured output validation (Zod); retry with different model; fallback to template |
| Stripe webhook failures | Low | High | Idempotent webhook handling; retry queue; alerting |
| Supabase RLS misconfiguration | Medium | Critical | Automated RLS testing in CI; audit logs |
| Data migration issues | Medium | High | Dry-run migration script; rollback plan; parallel run period |
| AI output injection/XSS | Medium | High | Zod schema validation; DOMPurify sanitization; CSP headers |
| OpenRouter API changes | Low | Medium | Version-pinned models; abstraction layer; monitoring |

---

## 9. Legacy Firebase/Genkit Artifacts to Delete

### Files to Remove
```
/src/firebase/                    # Entire directory
/src/ai/                          # Entire directory (Genkit flows)
/src/app/api/[[...genkit]]/       # Genkit API route
/firebase.json                    # Firebase config
/firestore.rules                  # Firestore rules
/storage.rules                    # Storage rules
/firebase/                        # Firebase admin SDK
.apphosting.yaml                  # Firebase App Hosting
.apphosting.emulator.yaml         # Emulator config
.env.example (Firebase vars)      # Remove Firebase vars
```

### Dependencies to Remove
```json
{
  "firebase": "^11.9.1",
  "firebase-admin": "^12.7.0",
  "genkit": "^1.22.0",
  "genkit-cli": "^0.0.2",
  "@genkit-ai/google-genai": "^1.22.0",
  "@genkit-ai/next": "^1.22.0",
  "@genkit-ai/firebase": "^1.22.0"
}
```

### Dependencies to Add
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/ssr": "^0.1.0",
  "openai": "^4.28.0",
  "zod": "^3.22.0"
}
```

---

## 10. Final Recommendation

### Is the app truly free and production-ready?

**Yes, with caveats:**

✅ **Free to run** (assuming):
- OpenRouter free tier remains available
- Supabase free tier (500MB DB, 1GB storage, 50K MAU) suffices
- Vercel free tier handles traffic
- Stripe only charges on successful payments

⚠️ **Requires monitoring**:
- OpenRouter free model availability (not guaranteed SLA)
- Supabase free tier limits (500MB DB, 2M edge requests)
- AI output quality requires validation layer

📋 **Production readiness checklist**:
- [ ] Schema migration tested with production data volume
- [ ] RLS policies tested against attack vectors
- [ ] AI fallback chain tested with model failures
- [ ] Stripe webhook idempotency verified
- [ ] Rate limiting prevents abuse
- [ ] CSP headers configured
- [ ] Error tracking (Sentry) configured
- [ ] Database backups enabled
- [ ] Stripe webhook endpoint registered in production
- [ ] Custom domain SSL configured
- [ ] Load testing completed

### Migration Effort Estimate

| Phase | Effort |
|-------|--------|
| Supabase setup & schema | 1 week |
| Auth migration | 3 days |
| API routes rewrite | 1.5 weeks |
| AI service layer | 1 week |
| Frontend integration | 1 week |
| Stripe migration | 2 days |
| Testing & QA | 1 week |
| Deployment & monitoring | 2 days |
| **Total** | **~6 weeks** |

---

## Conclusion

The migration is **feasible and recommended**. The resulting architecture will be:
- **Cheaper**: No Firebase/Genkit costs; OpenRouter free models
- **More portable**: Standard Postgres + standard Next.js
- **More controllable**: Full SQL access, no vendor lock-in
- **Production-ready**: With proper monitoring and fallbacks

The key success factor is the **AI abstraction layer** with robust fallback chains, as free model availability is the primary operational risk.