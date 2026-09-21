# PortfolioForge — Production Deployment Guide

> **Target stack:** Next.js 15 + Supabase (Postgres / Auth / Storage) + OpenRouter + Stripe
> **Host:** Vercel
> **Vercel project:** `portfolio-forge`
> **Production URL:** `https://portfolio-forge-beige.vercel.app`
> **Status:** Codebase builds (`npm run predeploy` passes). Deployment config needs completion before prod launch.

This guide is the step-by-step runbook to take PortfolioForge from `npm run dev` to a live production deployment. Follow it in order. Each phase ends with a verification checkpoint — do not skip them.

Related docs:

- [README.md](../README.md) — product overview, quick start
- [docs/BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md) — data models, RLS, API routes
- [docs/blueprint.md](blueprint.md) — product blueprint
- [docs/TESTING_GUIDE.md](TESTING_GUIDE.md) — test suites
- [supabase/migrations/001_initial_schema.sql](../supabase/migrations/001_initial_schema.sql) — canonical schema

---

## 0. Host: Vercel (`portfolio-forge`, existing Git CI/CD)

**Vercel is the only host.** All Firebase App Hosting artifacts (`apphosting.yaml`, `apphosting.emulator.yaml`, `NEXT_PUBLIC_FIREBASE_*`, `GOOGLE_GENAI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_KEY`) have been deleted from the repo:

| Artifact | Host | State |
|---|---|---|
| Vercel project `portfolio-forge` → `https://portfolio-forge-beige.vercel.app` | Vercel | **Current and already linked to git.** Previous Firebase version deployed through this same project's Git CI/CD — keep that connection, do not create a new Vercel project. Update env vars in place (§5) and redeploy. |
| No `vercel.json` checked in | Vercel | Missing — you will create one in Phase 6. |
| No `.github/workflows/` | CI/CD | Optional. Vercel Git CI/CD (push → Preview, `main` → Production) already covers deploys. Add a GitHub Actions workflow only for `lint → typecheck → test → test:e2e` checks (§11). |

> Firebase App Hosting is fully decommissioned for this project. Auth callbacks, `NEXT_PUBLIC_APP_URL`, and Stripe webhooks must all point at `https://portfolio-forge-beige.vercel.app`.

---

## 1. Prerequisites

- Node.js 20+, npm 10+
- Accounts: Supabase, Vercel (access to project `portfolio-forge`), OpenRouter, Stripe
- Production URL is fixed: `https://portfolio-forge-beige.vercel.app` — use it verbatim for all Site URL / redirect / referer / webhook config below. Add a custom domain later only if needed (§6.4)
- Stripe CLI (for webhook testing): https://stripe.com/docs/stripe-cli

```bash
node --version  # >= 20
npm --version   # >= 10
```

---

## 2. Create and configure the Supabase project

### 2.1 Create project

1. Go to https://supabase.com/dashboard → **New project**
2. Save these three values (Project Settings → API):
   - `NEXT_PUBLIC_SUPABASE_URL` — e.g. `https://xyzcompany.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — `eyJ...` (public, safe for browser)
   - `SUPABASE_SERVICE_ROLE_KEY` — `eyJ...` (**secret, server-only, never expose to client**)

### 2.2 Apply the schema migration

Run the canonical migration in `supabase/migrations/001_initial_schema.sql`. It creates:

- Tables: `profiles`, `portfolio_items`, `themes`, `messages`, `ai_usage`
- Indexes, RLS enablement + policies, `updated_at` triggers, `handle_new_user()` trigger, 4 seeded themes

Option A — Supabase SQL Editor (simplest):

1. Dashboard → SQL Editor → New query
2. Paste entire contents of `001_initial_schema.sql` → Run

Option B — Supabase CLI:

```bash
npm i -g supabase
supabase link --project-ref <project-ref>
supabase db push
# If using local migrations folder, ensure 001_initial_schema.sql is applied
```

### 2.3 `handle_new_user()` trigger (fixed in-repo)

The migration's `handle_new_user()` inserts only into columns that exist on `profiles` (`id`, `username`, `full_name`, `role` — there is intentionally no `email` column; email lives in `auth.users`). Run the migration as-is — no manual patch needed:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    'user_' || substr(NEW.id::text, 1, 8),
    NEW.raw_user_meta_data->>'full_name',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

> Historical note: an earlier version of this migration inserted into a non-existent `profiles.email` column, which made every signup fail. This was fixed in `supabase/migrations/001_initial_schema.sql` — if your database was created before the fix, apply the function above via SQL Editor to repair it.

### 2.4 Verify database

Run in SQL Editor:

```sql
-- Tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles','portfolio_items','themes','messages','ai_usage');

-- RLS enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles','portfolio_items','themes','messages','ai_usage');
-- all should be true

-- Policies present
SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'public';

-- Triggers active
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created','update_profiles_updated_at','update_portfolio_items_updated_at');

-- Seed themes
SELECT id, name, is_premium FROM themes;
-- expect 4 rows: minimal, developer, creative, dark
```

Checkpoint: 5 tables, RLS on, policies listed, 4 themes seeded, signup trigger fixed.

---

## 3. Configure Supabase Auth

App expects (`src/middleware.ts`, `src/lib/supabase/`):

- Email/Password
- Google OAuth, GitHub OAuth (GitHub also powers repo import)
- Magic Links (passwordless)

### 3.1 Dashboard → Authentication → Providers

Enable each provider you want. For each OAuth provider:

1. Create OAuth app in provider console (Google Cloud Console / GitHub → Settings → Developer settings → OAuth Apps). Do not enable Apple — it requires a paid Apple Developer membership.
2. Set authorization callback URL to:
   ```
   https://<supabase-project-ref>.supabase.co/auth/v1/callback
   ```
3. Paste Client ID + Secret into Supabase provider settings

### 3.2 Redirect URLs and Site URL

Dashboard → Authentication → URL Configuration:

- **Site URL:** `https://portfolio-forge-beige.vercel.app` (no trailing slash)
- **Redirect URLs (allow list):**
  ```
  https://portfolio-forge-beige.vercel.app/**
  https://portfolio-forge-beige.vercel.app/auth/callback
  http://localhost:3000/**
  http://localhost:3000/auth/callback
  ```

The app's OAuth callback route is `src/app/auth/callback/route.ts` (a page route, not under `/api`) — after Supabase redirects there, it exchanges the code and forwards to `?next=` (default `/dashboard`); failures go to `/login?error=auth_failed`. If logins hang on a blank page, a missing redirect URL is the #1 cause.

### 3.3 Email templates (Magic Link / confirm)

Authentication → Email Templates → set **Confirm sign up** and **Magic Link** links to `{{ .SiteURL }}/auth/callback?next=/dashboard` pattern used by your callback route. Test with a real inbox before launch.

Checkpoint: sign up → profile row auto-created in `profiles` → login → `/dashboard` loads without redirect loop.

---

## 4. Configure Supabase Storage

Architecture (`docs/BACKEND_ARCHITECTURE.md`) expects two buckets:

| Bucket | Contents | Read | Write |
|---|---|---|---|
| `portfolio-images` | Portfolio item images | Public | Authenticated, own path only |
| `cv-uploads` | CV files for parsing | Private (signed URLs) or owner-only | Authenticated, own path only |

### 4.1 Create buckets

Dashboard → Storage → New bucket (both **Public: off** initially — you control reads via policies; flip `portfolio-images` to public only if you serve images directly via public URL).

Or via SQL:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true),
       ('cv-uploads', 'cv-uploads', false)
ON CONFLICT (id) DO NOTHING;
```

### 4.2 Storage policies

```sql
-- Public read for portfolio images
CREATE POLICY "portfolio_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');

-- Authenticated users upload to their own folder
CREATE POLICY "portfolio_images_owner_write"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "portfolio_images_owner_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "portfolio_images_owner_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CV uploads: owner-only read + write
CREATE POLICY "cv_uploads_owner_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'cv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "cv_uploads_owner_write"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 4.3 next/image remote patterns

`next.config.js` already includes the Supabase Storage pattern for this project — keep it in sync if the project ref ever changes:

```js
// next.config.js → images.remotePatterns (committed):
{
  protocol: 'https',
  hostname: 'gydpgydodhvaazkynkih.supabase.co',
  pathname: '/storage/v1/object/public/**',
},
```

Without this entry, Supabase-served images 400 under `next/image`.

Checkpoint: upload via `POST /api/upload` → signed URL works → public image renders with `next/image`.

---

## 5. Environment variables (production)

Source of truth template: `.env.example`. Set these in **Vercel → Project → Settings → Environment Variables** (Production + Preview as needed). Never commit real secrets.

| Variable | Required | Where | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → Settings → API | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase → Settings → API | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase → Settings → API | **Server-only.** Used by `createServiceClient()` in `src/lib/supabase/server.ts` |
| `NEXT_PUBLIC_APP_URL` | Yes | Fixed: `https://portfolio-forge-beige.vercel.app` | Also sent as `HTTP-Referer` to OpenRouter (`src/lib/ai/openrouter.ts`) — must match exactly or OpenRouter may reject |
| `NEXT_PUBLIC_SITE_URL` | Yes | Fixed: `https://portfolio-forge-beige.vercel.app` | Keep identical to `NEXT_PUBLIC_APP_URL` |
| `OPENROUTER_API_KEY` | Yes (AI features) | openrouter.ai/keys | `sk-or-...`. Free-tier models used (see §7) |
| `STRIPE_SECRET_KEY` | Yes (billing) | Stripe Dashboard | Use `sk_live_...` in prod, `sk_test_...` in preview |
| `STRIPE_WEBHOOK_SECRET` | Yes (billing) | Stripe → Webhooks | `whsec_...`, per-endpoint |
| `STRIPE_PRICE_PRO_MONTHLY` | Yes (billing) | Stripe → Products | `price_...` for $12/mo Pro |
| `STRIPE_PRICE_STUDIO_MONTHLY` | Yes (billing) | Stripe → Products | `price_...` for $29/mo Studio |
| `STRIPE_PAYMENT_METHODS` | No | You define | `card` (default) or `card,paypal`. Must match methods enabled in Stripe Dashboard → Payment Methods (see §8.2b) |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics | `G-XXXXXXXX` |

> ⚠️ Price-ID naming mismatch: `src/lib/stripe.ts → getStripePriceId()` reads `STRIPE_PRO_PRICE_ID`, `STRIPE_PREMIUM_PRICE_ID`, `STRIPE_STARTER_PRICE_ID`, etc., while `.env.example` defines `STRIPE_PRICE_PRO_MONTHLY` / `STRIPE_PRICE_STUDIO_MONTHLY`. Align these before launch — either rename env vars or update `getStripePriceId()` — otherwise checkout throws `Stripe price ID is not configured for plan "..."`.

Local dev:

```bash
cp .env.example .env.local
# fill in real values
npm run dev
```

---

## 6. Deploy to Vercel (`portfolio-forge`, Git CI/CD already wired)

No new Vercel project. The `portfolio-forge` project already exists and previously auto-deployed the Firebase version via Git — reuse that same pipeline for the Supabase build.

Git flow (already active, keep it):

- Push to any branch / open PR → Vercel builds a **Preview** deployment
- Merge/push to production branch (`main`) → Vercel builds and promotes **Production** at `https://portfolio-forge-beige.vercel.app`
- `package.json → deploy:prod: vercel --prod` is manual-override only (Vercel CLI after `vercel login` + `vercel link`). Do not call it from CI — Git integration already deploys.

### 6.1 Add `vercel.json` (currently missing)

Create `vercel.json` at repo root and commit it so every Git deploy (Preview + Production) gets the right timeouts:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/ai/**/*.js": { "maxDuration": 30 },
    "src/app/api/stripe/webhook/**/*.js": { "maxDuration": 30 }
  }
}
```

> Note: Hobby plan caps at 10s regardless — AI routes (`cv-parse`, `theme-generate`) need Pro for 30s, or implement client polling/queue. Test `cv-parse` latency on Hobby before promising it in prod.

### 6.2 Reconfigure the existing project (do not re-import)

1. Vercel Dashboard → project **`portfolio-forge`** → Settings → Git → confirm the correct repo + production branch (`main`) is still connected (it carried over from the Firebase version)
2. Settings → Environment Variables → set §5 values for `portfolio-forge-beige.vercel.app`:
   - If any legacy Firebase-era vars still exist in the Vercel dashboard (`NEXT_PUBLIC_FIREBASE_*`, `GOOGLE_GENAI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_KEY`), **delete them** — the repo no longer references them (`apphosting.yaml` / `apphosting.emulator.yaml` deleted) and they are unused by this build
   - Set `NEXT_PUBLIC_APP_URL` = `NEXT_PUBLIC_SITE_URL` = `https://portfolio-forge-beige.vercel.app` (Production; use `http://localhost:3000` for Development, Preview inherits Production unless overridden)
   - Set Supabase, OpenRouter, Stripe vars per §5 (Production + Preview as needed)
3. Push the Supabase migration (this guide + `vercel.json`) to `main` → Vercel auto-builds Production. Or Deployments → Redeploy after env changes.

Manual override only:

```bash
npm run predeploy   # gate first
npm run deploy:prod # vercel --prod against portfolio-forge; rarely needed
```

### 6.3 Verify Git CI/CD after cutover

- Vercel → Deployments → latest Production commit matches `main` HEAD
- Visit `https://portfolio-forge-beige.vercel.app` → landing renders, no Firebase-config 500s
- Open a test PR → Preview deployment builds → merge → Production rebuilds

### 6.4 Custom domain (optional, later)

Vercel → `portfolio-forge` → Settings → Domains → Add custom domain. Update DNS as instructed, then update `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, Supabase redirect URLs (§3.2), and Stripe webhook (§8.2) to the custom domain and redeploy. Until then, everything points at `https://portfolio-forge-beige.vercel.app`.

Checkpoint: `https://portfolio-forge-beige.vercel.app` loads landing page, no env-missing 500s, deployments trigger from git.

---

## 7. OpenRouter / AI keys

AI layer: `src/lib/ai/openrouter.ts` (`OpenRouterAI` class, `openrouterAI` singleton).

- Free models used: `meta-llama/llama-3.2-11b-vision-instruct:free` (vision), `meta-llama/llama-3.1-8b-instruct:free` (text), `microsoft/phi-3-mini-128k-instruct:free` (long context), `google/gemma-2-9b-it:free` (creative)
- Fallback chains: each method tries primary → fallback via `withFallback()`
- Rate limit: in-memory 10 req/min per `userId:feature` (resets per serverless instance — Supabase-backed `ai_usage` counting is still TODO for durable enforcement)
- Structured output: all responses Zod-validated (`src/types`)

Setup:

1. https://openrouter.ai/keys → Create key → set `OPENROUTER_API_KEY` in Vercel
2. Ensure `NEXT_PUBLIC_APP_URL` is the exact prod URL (sent as `HTTP-Referer`; OpenRouter may throttle/flag mismatched referers)
3. Optional: set usage limits / credits alert in OpenRouter dashboard — free models are best-effort, no SLA

Checkpoint: logged-in → AI Assistant → content suggestion returns JSON-valid result; check Vercel logs for `Primary model failed, trying fallback` warnings (normal under free-tier churn).

---

## 8. Stripe billing

Wiring: `src/lib/stripe.ts`, `src/app/api/stripe/checkout/route.ts`, `portal/route.ts`, `webhook/route.ts`. Tier state syncs to `profiles`; RLS enforces ownership. Note: no server-side tier gate exists — the free-plan item limit is client-side only (see README).

### 8.1 Create products and prices

Stripe Dashboard → Products → create:

- **Pro** — $12/mo recurring → copy `price_...` → `STRIPE_PRICE_PRO_MONTHLY` (+ map to `STRIPE_PRO_PRICE_ID` per §5 warning)
- **Studio** — $29/mo recurring → copy `price_...` → `STRIPE_PRICE_STUDIO_MONTHLY`

### 8.2 Webhook endpoint

Stripe Dashboard → Developers → Webhooks → Add endpoint:

```
https://portfolio-forge-beige.vercel.app/api/stripe/webhook
```

Events to listen for (per `docs/BACKEND_ARCHITECTURE.md`):

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Copy the endpoint's **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET` in Vercel → redeploy.

### 8.2b Offer PayPal at checkout (optional)

PayPal is offered **through Stripe Checkout** — no separate PayPal integration:

1. Stripe Dashboard → Settings → Payment Methods → enable **PayPal** (test mode uses PayPal sandbox; verify subscription/recurring support for your regions and currencies)
2. Vercel → `portfolio-forge` → Environment Variables → set `STRIPE_PAYMENT_METHODS=card,paypal` (Production + Preview) → redeploy
3. Test checkout on `https://portfolio-forge-beige.vercel.app/billing` → PayPal appears alongside card

The checkout route (`src/app/api/stripe/checkout/route.ts`) reads `STRIPE_PAYMENT_METHODS` and passes it as `payment_method_types`. Default is `card` only. Every method listed must be enabled in the Stripe dashboard or session creation fails — so keep the env var and dashboard in sync.

### 8.3 Local webhook testing

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# use printed whsec_test_... as STRIPE_WEBHOOK_SECRET in .env.local
stripe trigger checkout.session.completed
```

### 8.4 Verify sync

After a test checkout: `profiles` row should show `subscription_tier='pro'`, `subscription_status='active'`, `stripe_customer_id` / `stripe_subscription_id` populated.

Checkpoint: test checkout → webhook 200 → profile updated → Pro gates (unlimited items, premium themes) unlock.

---

## 9. Pre-deploy gate (run every time)

```bash
cp .env.example .env.local   # first time only; fill real values
npm install
npm run predeploy            # lint + typecheck + next build
npm run test                 # Vitest unit + component
npx playwright install       # first time only
npm run test:e2e             # Playwright (needs dev server or preview URL)
```

> `next build` imports `src/lib/ai/openrouter.ts` at build time, which instantiates the OpenAI client at module load — so `OPENROUTER_API_KEY` (plus the Supabase public vars) **must be set in the build environment**, otherwise the build fails with `OPENAI_API_KEY ... missing or empty`. Vercel provides these automatically; for local/CI builds without secrets, export a dummy (`OPENROUTER_API_KEY=dummy npm run build`).

Deploy only when:

- [ ] `npm run predeploy` green (lint warnings triaged, typecheck + build pass)
- [ ] Supabase live: tables, RLS, triggers, themes, buckets, policies verified
- [ ] Auth providers + redirect URLs configured for prod domain
- [ ] All §5 env vars set in Vercel Production
- [ ] Stripe webhook live and test purchase syncs to `profiles`
- [ ] `OPENROUTER_API_KEY` set and AI smoke test passes

---

## 10. Post-deploy smoke tests

Run against the production URL:

1. **Landing + legal:** `/`, `/pricing`, `/terms`, `/privacy` render, no console errors
2. **Auth:** signup → profile row created → login → `/dashboard` (no loop) → logout → protected route redirects to `/login?redirect=...`
3. **Profile:** edit headline/bio → persists to `profiles`
4. **Portfolio CRUD:** create item via UI (goes through `POST /api/portfolio-items`) → UI blocks the 4th item on free plan → delete works → public `/portfolio/[username]` renders. Note: the block is client-side only — the API performs no tier check (known gap, see README). If PayPal enabled, also complete one PayPal checkout.
5. **Upload:** image upload → `portfolio-images/{userId}/...` → renders via `next/image`
6. **AI:** CV parse, LinkedIn parse, content suggest, theme generate — each returns structured result or clean rate-limit error
7. **Billing:** checkout → webhook → tier upgrade → portal opens → cancel → tier resets
8. **Contact:** public portfolio contact form → `POST /api/contact` → row in `messages` (owner-readable only)
9. **Admin:** non-admin `/admin` blocked; admin sees user list

API curl spot-checks (replace tokens/ids):

```bash
BASE=https://portfolio-forge-beige.vercel.app

# Health: public themes list
curl -s $BASE/api/themes | head -c 500

# Authenticated portfolio list (get ID token from browser devtools → Application → IndexedDB / supabase auth)
curl -s $BASE/api/portfolio-items -H "Authorization: Bearer $SUPABASE_JWT" | head -c 500

# Stripe webhook reachable (expect 400 signature error, not 404/500)
curl -s -X POST $BASE/api/stripe/webhook -H "Content-Type: application/json" -d '{}' -w "\n%{http_code}\n"
```

---

## 11. Operations after launch

| Area | Action |
|---|---|
| Monitoring | Vercel Analytics + Speed Insights on; Supabase → Reports for DB/auth/storage; OpenRouter activity for model errors/rate limits |
| Logs | Vercel → Logs (API errors); Supabase → Logs (Auth/Database/Storage); app uses structured logger `src/lib/logger.ts` + OpenTelemetry `src/telemetry/init.ts` |
| Backups | Supabase → Database → Backups (daily on paid plans; `pg_dump` manually on free) |
| Alerts | Supabase usage at 70% (500MB DB / 1GB storage on free); Stripe failed-payment alerts; OpenRouter free-model deprecation notices |
| Secrets rotation | Rotate `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `OPENROUTER_API_KEY` via Vercel env + redeploy; never commit to git |
| CI | Vercel Git CI/CD already deploys (`portfolio-forge`). Optionally add `.github/workflows/ci.yml` for `lint → typecheck → test → test:e2e` checks on push/PR; use Vercel → Settings → Git → required checks so broken code never promotes to `https://portfolio-forge-beige.vercel.app` |

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Signup succeeds but no `profiles` row / app 500s | Stale `handle_new_user()` on a DB created before the fix (§2.3) | Re-apply fixed function from §2.3, retry signup |
| OAuth hangs / `redirect_uri_mismatch` | Supabase redirect URLs missing prod domain | Add URLs per §3.2, redeploy |
| `NEXT_PUBLIC_SUPABASE_URL` undefined in prod | Env var set for Preview only | Set for Production in Vercel, redeploy |
| Images 400 with `next/image` | Supabase hostname missing from `remotePatterns` | Add pattern per §4.3 |
| AI 500 / empty response | Free model down or referer mismatch | Check logs for fallback warnings; verify `NEXT_PUBLIC_APP_URL`; retry (fallbacks are automatic) |
| `Stripe price ID is not configured` | Env naming mismatch (§5) | Align `STRIPE_*` names with `getStripePriceId()` |
| Stripe webhook 400 | Wrong `STRIPE_WEBHOOK_SECRET` (test vs live) | Use secret from the exact endpoint; redeploy |
| AI route times out on Vercel Hobby | 10s Hobby limit | Upgrade to Pro for 30s or add polling/queue |
| Hydration error | Supabase SSR cookie mismatch | Ensure `src/middleware.ts` matcher covers route; don't conditionally render auth state before mount |

---

## 13. Minimal launch checklist (copy/paste)

```text
[ ] Supabase project created, URL + anon + service_role saved
[ ] 001_initial_schema.sql applied (handle_new_user() already fixed in-repo)
[ ] Tables/RLS/triggers/themes verified via SQL
[ ] Auth providers enabled, Site URL + redirect URLs set for prod domain
[ ] Storage buckets + policies created, next/image remote pattern added
[ ] All env vars (§5) set in Vercel project `portfolio-forge` (Production), Firebase-era vars removed
[ ] vercel.json committed (30s AI/webhook timeout)
[ ] NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_SITE_URL = https://portfolio-forge-beige.vercel.app
[ ] Stripe products/prices created, webhook https://portfolio-forge-beige.vercel.app/api/stripe/webhook live, test purchase syncs
[ ] OPENROUTER_API_KEY set, AI smoke test passes
[ ] npm run predeploy + tests green
[ ] Git push to main → Vercel Production deploy green at https://portfolio-forge-beige.vercel.app
[ ] Post-deploy smoke tests (§10) all pass
[ ] Monitoring, backups, alerts configured
```

Once every box is checked, PortfolioForge is production-ready on Vercel + Supabase.
