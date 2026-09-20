# PortfolioForge

A modern, AI-powered portfolio builder for developers, designers, and freelancers. Build beautiful, customizable portfolio websites with AI-assisted content generation, seamless data imports, and professional themes — all powered by free AI models.

---

## ✨ Features

### Data Import & AI Parsing
- **CV/Resume Upload** — Upload PDF or image; multi-modal AI (Llama 3.2 Vision) extracts structured profile data
- **LinkedIn Import** — Paste LinkedIn profile text; AI infers experience, education, skills
- **GitHub Import** — Fetch public repos, auto-generate AI summaries (Llama 3.1)
- **URL Import** — Crawl any public URL, extract portfolio-ready content (Phi-3 Mini)

### AI Content Generation
- **Content Suggester** — Inline AI rewrites for descriptions, summaries, headlines
- **Portfolio Assistant** — Generates professional headline & summary from all imported data
- **Theme Generator** — Describe a style in plain text; AI returns complete theme config (palettes, fonts, radii)
- **Translator** — Translate portfolio content to other languages
- **README Summarization** — 1-2 sentence repo summaries for GitHub imports

### Portfolio & Theming
- **4 Built-in Themes** — Minimal, Developer, Creative, Dark (stored in Supabase)
- **3 Public Layouts** — Freelancer, Agency, Stylish Portfolio
- **AI Custom Themes** — User-generated themes stored per-profile, applied via CSS custom properties
- **Theme Preview** — Full-page preview before saving

### Monetisation (Stripe)
| Feature | Free | Pro ($12/mo) | Studio ($29/mo) |
|---------|------|--------------|-----------------|
| Portfolio Items | 3 | Unlimited | Unlimited |
| Custom Domain | ❌ | ✅ | ✅ |
| Premium Themes | ❌ | ✅ | ✅ |
| Custom AI Theme | ❌ | ✅ | ✅ |
| Remove Branding | ❌ | ✅ | ✅ |
| AI Usage/Day | 10 | 100 | 500 |
| Team Members | ❌ | ❌ | 5 |

- **Stripe Checkout** — `/api/stripe/checkout` creates sessions for Pro/Studio (card by default)
- **PayPal (optional)** — offered through Stripe Checkout via `STRIPE_PAYMENT_METHODS=card,paypal`
- **Billing Portal** — `/api/stripe/portal` for self-service plan management
- **Webhook Sync** — Real-time subscription status updates to Supabase

### Auth & Access Control
- Google, GitHub OAuth + Magic Links via Supabase Auth
- Email/Password authentication
- Anonymous/read-only mode with UI banners
- Middleware-protected routes (`/dashboard`, `/settings`, `/import-data`, `/ai-assistant`, `/billing`)
- Free-plan limits enforced server-side (API + RLS)

### Admin
- `/admin` panel (role: `admin` only) — user list with tier, status, role

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15, App Router, Turbopack |
| Language | TypeScript 5 |
| UI Components | ShadCN UI (Radix primitives) |
| Styling | Tailwind CSS v3, CSS custom properties for theming |
| Backend | Next.js API routes (serverless) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| File Storage | Supabase Storage |
| Hosting | Vercel |
| AI Runtime | OpenRouter (free models: Llama 3.2 Vision, Llama 3.1, Gemma 2, Phi-3 Mini) |
| AI Abstraction | Custom `OpenRouterAI` class with fallback chains + Zod validation |
| Payments | Stripe (Checkout + Billing Portal + Webhooks; card + optional PayPal) |
| Observability | Vercel Analytics, Core Web Vitals, OpenTelemetry (server), structured logger |
| Testing | Vitest, React Testing Library, Playwright |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Supabase account
- OpenRouter API key (free tier)
- Stripe account (for billing)

### Installation

```bash
# Clone and install
git clone https://github.com/your-org/portfolioforge.git
cd portfolioforge
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials (see Environment Variables below)

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

Create `.env.local` from `.env.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# OpenRouter (free models)
OPENROUTER_API_KEY=sk-or-xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_STUDIO_MONTHLY=price_xxx
# Optional: card (default) or card,paypal — must match Stripe Dashboard → Payment Methods
STRIPE_PAYMENT_METHODS=card

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXX
```

### Getting API Keys

| Service | Where to Get |
|---------|--------------|
| Supabase | [supabase.com](https://supabase.com) → Project Settings → API |
| OpenRouter | [openrouter.ai](https://openrouter.ai/keys) → Create Key (free tier available) |
| Stripe | [stripe.com](https://dashboard.stripe.com/apikeys) → Test keys for dev |

---

## 🗄 Database Setup (Supabase)

1. Create a new Supabase project
2. Run migrations:
   ```bash
   npx supabase db push
   # Or apply manually: supabase/migrations/001_initial_schema.sql
   ```
3. Enable Auth providers in Supabase Dashboard:
   - Email/Password
   - Google OAuth
   - GitHub OAuth (for GitHub import)
   - Magic Links
4. Create Storage buckets:
   - `portfolio-images` (public read, authenticated write to user path)
   - `cv-uploads` (authenticated write to user path)
5. Add Stripe webhook endpoint: `https://portfolio-forge-beige.vercel.app/api/stripe/webhook`

---

## 🧪 Testing

```bash
# Unit + component tests (Vitest)
npm run test
npm run test:watch    # watch mode
npm run test:ui       # Vitest browser UI

# End-to-end tests (Playwright)
npx playwright install  # first time only
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint

# Full pre-deploy check
npm run predeploy     # lint + typecheck + build
```

### Test Structure
```
tests/
├── unit/           # Pure utility functions (Vitest)
├── frontend/       # Component tests (Vitest + RTL)
├── e2e/            # Browser automation (Playwright)
├── contract/       # API contract tests (placeholder)
└── performance/    # Load/Lighthouse tests (placeholder)
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── profile/            # GET/PUT profile, check-username
│   │   ├── portfolio-items/    # CRUD + reorder (no server-side tier gate — see below)
│   │   ├── themes/             # GET themes
│   │   ├── ai/                 # cv-parse, linkedin-parse, github-import, web-import,
│   │   │                       # content-suggest, theme-generate, translate
│   │   ├── stripe/             # Checkout, portal, webhook
│   │   ├── upload/             # Signed upload URLs
│   │   └── contact/            # Contact form
│   ├── auth/callback/          # Supabase OAuth callback route (exchanges code, honors ?next=)
│   ├── dashboard/              # Authenticated app pages
│   ├── portfolio/              # Public portfolio renderer
│   ├── admin/                  # Admin panel
│   ├── import-data/            # Data import UI
│   ├── ai-assistant/           # AI content assistant
│   ├── billing/                # Stripe billing UI
│   ├── settings/               # User settings
│   └── (public pages)          # Landing, pricing, login, signup, legal
├── components/
│   ├── ui/                     # ShadCN UI primitives (do not edit)
│   └── ...                     # Shared layout & feature components
├── hooks/
│   ├── use-supabase.ts         # useUser(), useSupabase(), useAuth()
│   └── ...                     # use-mobile, use-toast, use-translation
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client + service role (createClient/createServiceClient)
│   │   └── middleware.ts       # Auth middleware helper (updateSession)
│   ├── ai/
│   │   └── openrouter.ts       # OpenRouterAI class with fallback chains (+ index.ts)
│   ├── stripe.ts               # Stripe instance (lazy getStripe proxy)
│   ├── logger.ts               # Structured JSON logger
│   ├── utils.ts                # cn() helper, etc.
│   └── ...                     # data, theme-schema, web-vitals, placeholder-images
├── middleware.ts               # Route protection (Supabase SSR)
├── telemetry/
│   └── init.ts                 # OpenTelemetry server init
└── types/index.ts              # Zod schemas + TS types for all data models
```

---

## 🔑 Key Implementation Details

### AI Service (`src/lib/ai/openrouter.ts`)
- **OpenRouterAI class** with unified `callModel()` method
- **Rate limiting**: In-memory (10 req/min per feature per user)
- **Fallback chains**: Primary → fallback model on failure
- **Structured output**: Zod schema validation on all responses
- **Vision support**: Base64 data URIs for CV parsing

### Plan limits (current state)

- **Client-side only.** The free-plan 3-item limit is enforced in the UI (`projects` page, `add-project-dialog`, `import-data`).
- **No server-side tier gate.** `POST /api/portfolio-items` validates auth + schema only; there is no `entitlements` module and no item-count check. RLS enforces owner-only writes, not plan limits.
- ⚠️ **Known gap:** a free user can bypass the UI limit via direct API calls. A server-side count check against `subscription_tier` is still TODO.

### Middleware (`src/middleware.ts`)
Protects routes using `@supabase/ssr` for cookie-based session management.

### Database Schema
Key tables: `profiles`, `portfolio_items`, `themes`, `messages`, `ai_usage`
- All tables have RLS enabled
- Public read for profiles, portfolio_items, themes
- Owner-only write for profiles, portfolio_items, messages, ai_usage
- Triggers: `on_auth_user_created`, `update_updated_at_column`

---

## 🚀 Deployment

**Live:** Vercel project `portfolio-forge` → `https://portfolio-forge-beige.vercel.app` (Git CI/CD: PR → Preview, `main` → Production). Firebase App Hosting is fully decommissioned.

Full runbook: **[docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** — Supabase setup (including the required `handle_new_user()` fix), Auth providers (Google + GitHub only, no Apple), Storage buckets, env vars, Stripe + PayPal, pre-deploy gate, smoke tests.

Quick reference:
1. Env vars live in Vercel → `portfolio-forge` → Settings → Environment Variables (see table above)
2. `vercel.json` gives AI/webhook routes a 30s timeout (Pro plan required for >10s)
3. Stripe webhook: `https://portfolio-forge-beige.vercel.app/api/stripe/webhook`
4. Gate every release: `npm run predeploy` (+ `npm run test`, `npm run test:e2e`)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Development workflow, coding standards, PR checklist |
| **[docs/blueprint.md](docs/blueprint.md)** | Product blueprint: features, stack, style guidelines, status |
| **[docs/BACKEND_ARCHITECTURE.md](docs/BACKEND_ARCHITECTURE.md)** | Technical reference: data models, API routes, auth, AI, Stripe, deployment |
| **[docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)** | Testing strategy, tools, running tests, CI/CD |
| **[docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** | Production runbook (Vercel `portfolio-forge`, Supabase, Stripe + PayPal) |

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Coding standards
- Adding new AI flows
- Pull request checklist

---

## 📄 License

TBD — no `LICENSE` file is committed yet (`package.json` is `"private": true`). Add one before public release.

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/portfolioforge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/portfolioforge/discussions)

---

## 📝 Changelog Highlights

### Current
- ✅ Vercel-only hosting (`portfolio-forge` → `portfolio-forge-beige.vercel.app`); Firebase App Hosting configs deleted
- ✅ Supabase Auth with Google, GitHub, Magic Links (Apple OAuth removed)
- ✅ PayPal available through Stripe Checkout (`STRIPE_PAYMENT_METHODS=card,paypal`)
- ✅ All AI flows use free OpenRouter models with fallback chains
- ✅ React hydration stable (Supabase SSR middleware)
- ✅ No dummy data — empty states & loading skeletons
- ✅ Design system tokens only (no raw Tailwind colors)
- ✅ Portfolio item creation via API only (RLS enforces owner-only writes)
- ⚠️ Free-plan item limit is client-side only — no server-side tier gate yet (see above)

### Legacy (Firebase/Genkit — Removed)
- Firebase Auth, Firestore, Storage, App Hosting
- Genkit flows with Google Gemini
- Firebase Admin SDK for server operations
- `firebase.json`, `firestore.rules`, `storage.rules`, `apphosting.yaml`, `apphosting.emulator.yaml` (all deleted)
- `docs/backend.json` Firebase spec (archived to `docs/archive/`)