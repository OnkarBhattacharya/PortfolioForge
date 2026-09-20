# PortfolioForge — Backend Architecture

This document is the technical reference for the backend infrastructure. It covers data models, Supabase/PostgreSQL structure, authentication, server-side patterns, and the Stripe monetisation layer.

---

## Overview

The backend is built entirely on **Supabase** (PostgreSQL, Auth, Storage) with **Next.js API routes** handling server-side logic. AI capabilities are provided by **OpenRouter** (free models: Llama 3.2 Vision, Llama 3.1, Gemma 2, Phi-3 Mini) via a custom abstraction layer with fallback chains.

---

## 1. Data models

### `profiles` table (extends `auth.users`)

The root table for every user. Its ID matches the Supabase Auth UID.

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Supabase Auth UID (PK, FK to `auth.users`) |
| `username` | TEXT | Unique username for public portfolio URL |
| `full_name` | TEXT | Display name |
| `headline` | TEXT | Professional headline |
| `bio` | TEXT | Professional bio |
| `avatar_url` | TEXT | Avatar image URL |
| `links` | JSONB | `{ github, linkedin, twitter, website }` |
| `skills` | TEXT[] | Top skills extracted by AI |
| `theme_id` | TEXT | Selected built-in theme ID (default: `'minimal'`) |
| `custom_theme` | JSONB | AI-generated theme config; takes precedence over `theme_id` |
| `subscription_tier` | TEXT | `'free' \| 'pro' \| 'studio'` (CHECK constraint) |
| `subscription_status` | TEXT | `'active' \| 'inactive' \| 'past_due' \| 'canceled'` |
| `stripe_customer_id` | TEXT | Stripe customer ID |
| `stripe_subscription_id` | TEXT | Stripe subscription ID |
| `role` | TEXT | `'user' \| 'admin'` (CHECK constraint) |
| `created_at` | TIMESTAMPTZ | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

### `portfolio_items` table

One row per portfolio item, linked to user profile.

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Auto-generated (PK) |
| `user_id` | UUID | Owning user's profile ID (FK to `profiles`) |
| `title` | TEXT | Item title |
| `description` | TEXT | Item description (may be AI-generated) |
| `content_md` | TEXT | Full markdown content |
| `tags` | TEXT[] | Skills / technologies |
| `image_url` | TEXT | Image URL from Supabase Storage |
| `project_url` | TEXT | Link to live project, repo, or case study |
| `repo_url` | TEXT | GitHub repository URL |
| `featured` | BOOLEAN | Featured flag (default: false) |
| `sort_order` | INT | Position index (default: 0) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

### `messages` table

Contact form submissions received on a user's public portfolio.

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Auto-generated (PK) |
| `user_id` | UUID | Portfolio owner's profile ID (FK to `profiles`) |
| `sender_name` | TEXT | Sender name |
| `sender_email` | TEXT | Sender email |
| `subject` | TEXT | Message subject |
| `message` | TEXT | Message body |
| `read` | BOOLEAN | Read flag (default: false) |
| `created_at` | TIMESTAMPTZ | Submission timestamp |

### `themes` table (static seed data)

Built-in themes, publicly readable.

| Field | Type | Description |
|---|---|---|
| `id` | TEXT | Primary key (e.g. `'minimal'`, `'developer'`, `'creative'`, `'dark'`) |
| `name` | TEXT | Display name |
| `description` | TEXT | Short description |
| `css_vars` | JSONB | Full CSS custom property values for light/dark |
| `preview_image_url` | TEXT | Preview image URL |
| `is_premium` | BOOLEAN | Requires Pro/Studio to select (default: false) |

### `ai_usage` table (rate limiting)

Tracks AI feature usage per user for rate limiting.

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Auto-generated (PK) |
| `user_id` | UUID | User's profile ID (FK to `profiles`) |
| `feature` | TEXT | Feature name (e.g., `'cv_parse'`, `'github_import'`) |
| `model` | TEXT | OpenRouter model used |
| `tokens_in` | INT | Input tokens |
| `tokens_out` | INT | Output tokens |
| `created_at` | TIMESTAMPTZ | Usage timestamp |

---

## 2. Supabase Schema & RLS

### Key Indexes

```sql
CREATE INDEX idx_portfolio_items_user_id ON portfolio_items(user_id);
CREATE INDEX idx_portfolio_items_featured ON portfolio_items(user_id, featured) WHERE featured;
CREATE INDEX idx_portfolio_items_sort ON portfolio_items(user_id, sort_order);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_ai_usage_user_date ON ai_usage(user_id, created_at DESC);
```

### RLS Policies

All tables have RLS enabled. Policies:

- **profiles**: Public read; owner full write
- **portfolio_items**: Public read; owner full write
- **themes**: Public read only
- **messages**: Owner read only
- **ai_usage**: Owner read only

### Triggers

- `on_auth_user_created`: Creates profile row on signup
- `update_updated_at_column`: Auto-updates `updated_at` on `profiles` and `portfolio_items`

---

## 3. Supabase Authentication

### Providers Enabled

| Provider | Configuration |
|---|---|
| Email/Password | Enabled |
| Google OAuth | Enabled (via Supabase dashboard) |
| GitHub OAuth | Enabled (for GitHub import flow) |
| Magic Links | Enabled (passwordless option) |

### Auth Flow

1. **Signup**: User signs up via Supabase Auth → DB trigger creates profile row
2. **Login**: Supabase Auth handles session → JWT in cookie
3. **Session**: Server-side validation via `supabase.auth.getUser()`
4. **Profile Creation**: Database trigger on `auth.users` insert creates profile

---

## 4. AI Strategy Using Free OpenRouter Models

### Model Mapping

| Use Case | Primary Model | Fallback Model |
|---|---|---|
| CV Parsing (Vision) | `meta-llama/llama-3.2-11b-vision-instruct:free` | `google/gemma-2-9b-it:free` |
| LinkedIn Parsing | `meta-llama/llama-3.1-8b-instruct:free` | `microsoft/phi-3-mini-128k-instruct:free` |
| GitHub README Summary | `meta-llama/llama-3.1-8b-instruct:free` | `microsoft/phi-3-mini-128k-instruct:free` |
| Web Import/Extraction | `meta-llama/llama-3.1-8b-instruct:free` | `microsoft/phi-3-mini-128k-instruct:free` |
| Content Suggestions | `meta-llama/llama-3.1-8b-instruct:free` | `google/gemma-2-9b-it:free` |
| Theme Generation | `meta-llama/llama-3.1-8b-instruct:free` | `google/gemma-2-9b-it:free` |
| Translation | `meta-llama/llama-3.1-8b-instruct:free` | `google/gemma-2-9b-it:free` |
| README Summarization | `meta-llama/llama-3.1-8b-instruct:free` | `microsoft/phi-3-mini-128k-instruct:free` |

### AI Service Abstraction Layer (`src/lib/ai/openrouter.ts`)

- **OpenRouterAI class** with unified `callModel()` method
- **Rate limiting**: In-memory (10 req/min per feature per user)
- **Fallback chains**: Each method tries primary → fallback on failure
- **Structured output**: Zod schema validation on all responses
- **Vision support**: Base64 image data URIs for CV parsing

### AI Features

| Route | Method | Description |
|---|---|---|
| `POST /api/ai/cv-parse` | `parseCV()` | Multi-modal CV parsing (PDF/image) |
| `POST /api/ai/linkedin-parse` | `parseLinkedIn()` | LinkedIn text parsing |
| `POST /api/ai/github-import` | `importGitHub()` | Fetches repos, summarizes via OpenRouter |
| `POST /api/ai/web-import` | `importWeb()` | Crawls URL, extracts portfolio data |
| `POST /api/ai/content-suggest` | `suggestContent()` | Returns headline + summary suggestions |
| `POST /api/ai/theme-generate` | `generateTheme()` | Returns `ThemeConfig` from prompt |
| `POST /api/ai/translate` | `translate()` | Translates text array to target language |

> Note: `summarizeReadme()` exists on the `OpenRouterAI` class but has **no HTTP route** — there is no `/api/ai/readme-summary`. Expose one before documenting it.

---

## 5. API Route Structure (Next.js App Router)

```
/app/
├── auth/callback/route.ts         # Supabase OAuth callback (page route, NOT under /api)
├── api/
│   ├── profile/
│   │   ├── route.ts               # GET/PUT profile
│   │   └── check-username/route.ts # Check username availability
│   ├── portfolio-items/
│   │   ├── route.ts               # GET/POST items (auth + schema validation; no tier gate)
│   │   ├── [id]/route.ts          # GET/PUT/DELETE item
│   │   └── reorder/route.ts       # POST reorder items
│   ├── themes/
│   │   └── route.ts               # GET themes
│   ├── ai/
│   │   ├── cv-parse/route.ts          # POST parse CV
│   │   ├── linkedin-parse/route.ts    # POST parse LinkedIn
│   │   ├── github-import/route.ts     # POST import GitHub
│   │   ├── web-import/route.ts        # POST import web URL
│   │   ├── content-suggest/route.ts   # POST content suggestions
│   │   ├── theme-generate/route.ts    # POST generate theme
│   │   └── translate/route.ts         # POST translate
│   ├── stripe/
│   │   ├── checkout/route.ts      # POST create checkout (payment_method_types from STRIPE_PAYMENT_METHODS)
│   │   ├── portal/route.ts        # POST billing portal
│   │   └── webhook/route.ts       # POST Stripe webhook
│   ├── upload/
│   │   └── route.ts               # POST signed upload URLs
│   └── contact/
│       └── route.ts               # POST contact form
```

### Middleware (auth protection)

`src/middleware.ts` protects routes:
- Protected: `/dashboard`, `/settings`, `/import-data`, `/ai-assistant`, `/billing`
- Auth pages: `/login`, `/signup` (redirect if already logged in)

---

## 6. Premium Subscription Gating

### Plan Tiers

| Feature | Free | Pro ($12/mo) | Studio ($29/mo) |
|---|---|---|---|
| Portfolio Items | 3 | Unlimited | Unlimited |
| Custom Domain | ❌ | ✅ | ✅ |
| Premium Themes | ❌ | ✅ | ✅ |
| Custom Theme | ❌ | ✅ | ✅ |
| Remove Branding | ❌ | ✅ | ✅ |
| AI Usage/Day | 10 | 100 | 500 |

### Enforcement (current state)

There is **no `entitlements` module and no server-side tier gate**. Concretely:

- `POST /api/portfolio-items` checks auth + Zod schema only — it never reads `subscription_tier` and never counts items. A free user can exceed 3 items via direct API calls.
- The 3-item free limit is enforced **client-side only** (`projects` page, `add-project-dialog`, `import-data`).
- RLS enforces **ownership** (`auth.uid() = user_id`), not plan limits.
- Stripe webhook syncs `subscription_tier` / `subscription_status` to `profiles`, and the billing UI reads them — but no API route gates on them.

⚠️ **TODO:** add a server-side count check in `POST /api/portfolio-items` (and durable `ai_usage`-based AI rate limiting) before claiming enforcement.

---

## 7. Stripe Integration

### Routes

| Route | Description |
|---|---|
| `POST /api/stripe/checkout` | Creates Checkout Session with `metadata.userId`; `payment_method_types` from `STRIPE_PAYMENT_METHODS` (`card` default, `card,paypal` for PayPal) |
| `POST /api/stripe/portal` | Creates Billing Portal Session |
| `POST /api/stripe/webhook` | Updates `profiles` table with subscription status |

### Payment methods

Card is default. PayPal is offered **through Stripe Checkout** (no separate PayPal integration): enable PayPal in Stripe Dashboard → Settings → Payment Methods, then set `STRIPE_PAYMENT_METHODS=card,paypal`. Env var and dashboard must stay in sync — listing a disabled method fails session creation. Tier is derived from the price nickname (`Pro`/`Studio`, see webhook route).

### Webhook Events Handled

| Event | Action |
|---|---|
| `checkout.session.completed` | Creates/updates customer, sets subscription active |
| `customer.subscription.created/updated` | Updates tier, status, period end, cancel flags |
| `customer.subscription.deleted` | Resets tier to 'free', status to 'canceled' |
| `invoice.payment_succeeded` | Sets status 'active', records latest invoice |
| `invoice.payment_failed` | Sets status 'past_due', records failed invoice |

---

## 8. Supabase Storage

### Buckets

- `portfolio-images` — Portfolio item images
- `cv-uploads` — CV files for parsing

### Policies

- Authenticated uploads only to user's own path (`{userId}/...`)
- Public reads for all assets
- File size limits enforced client-side + server-side

### Signed Upload URLs

`POST /api/upload` returns signed upload URL + public URL for direct client uploads.

---

## 9. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# OpenRouter
OPENROUTER_API_KEY=sk-or-xxx

# App
NEXT_PUBLIC_APP_URL=https://portfolioforge.com
NEXT_PUBLIC_SITE_URL=https://portfolioforge.com

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_STUDIO_MONTHLY=price_xxx
STRIPE_PAYMENT_METHODS=card

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXX
```

---

## 10. Deployment

### Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": { "maxDuration": 30 }
  }
}
```

### Supabase Setup

1. Create Supabase project
2. Run schema migration (`supabase/migrations/001_initial_schema.sql`)
3. Enable Auth providers (Google, GitHub)
4. Configure Storage buckets: `portfolio-images`, `cv-uploads`
5. Set up Storage policies
6. Add Stripe webhook URL in Stripe dashboard

---

## 11. Observability

| Tool | Purpose |
|---|---|
| Vercel Analytics | Page views, Web Vitals |
| Structured logger (`src/lib/logger.ts`) | Replaces `console.*`; structured JSON output |
| OpenTelemetry (`src/telemetry/init.ts`) | Server-side trace spans; console exporter in dev |
| Supabase Logs | Auth, Database, Storage, Edge Functions |

---

## 12. Production Risk Assessment & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| OpenRouter free model unavailable | Medium | High | Multi-model fallback chain; cached responses; graceful degradation |
| OpenRouter rate limits | High | Medium | Client + server rate limiting; queue with exponential backoff |
| Supabase free tier limits | Low | High | Monitor usage; alert at 70%; upgrade path documented |
| AI output quality variance | High | Medium | Structured output validation (Zod); retry with different model; fallback to template |
| Stripe webhook failures | Low | High | Idempotent webhook handling; retry queue; alerting |
| Supabase RLS misconfiguration | Medium | Critical | Automated RLS testing in CI; audit logs |

---

## 13. Migration Notes

### Removed (Firebase/Genkit)

- `src/firebase/` — entire directory
- `src/ai/flows/` — entire directory
- `src/app/api/[[...genkit]]/` — Genkit dev UI
- `firebase.json`, `firestore.rules`, `storage.rules`, `.firebaserc`
- `.apphosting.yaml`, `.apphosting.emulator.yaml`
- Dependencies: `firebase`, `firebase-admin`, `genkit`, `@genkit-ai/*`

### Added (Supabase/OpenRouter)

- `@supabase/supabase-js`, `@supabase/ssr`
- `openai` (OpenRouter-compatible)
- `zod` (schema validation)

---

## 14. Key Files Reference

```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # createClient() + createServiceClient()
│   │   └── middleware.ts  # updateSession() helper
│   ├── ai/
│   │   └── openrouter.ts  # OpenRouterAI class with fallbacks
│   └── stripe.ts          # Lazy Stripe proxy (getStripe)
├── hooks/
│   └── use-supabase.ts    # useUser(), useSupabase(), useAuth()
├── middleware.ts          # Route protection
├── app/auth/callback/route.ts  # OAuth code exchange (src/app, not src/app/api)
├── app/api/               # All API routes (see section 5)
└── types/index.ts         # Zod schemas + TS types for all data models
```