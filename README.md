# PortfolioForge

> The intelligent portfolio platform for every professional.

PortfolioForge lets professionals launch an AI-native portfolio in minutes. Import a CV, LinkedIn text, GitHub repos, or any public URL — let AI craft the narrative — then publish with premium themes on a custom domain.

---

## What ships today

| Area | Details |
|---|---|
| Public pages | Landing, pricing, privacy policy, terms, cookie policy |
| App shell | Dashboard, portfolio items, AI assistant, billing, settings |
| AI flows | CV parser, LinkedIn parser, GitHub importer, URL importer, content suggester, theme generator, translator |
| Monetisation | Stripe Checkout + Billing Portal + webhook → Firestore subscription sync |
| Auth | Google, Apple, anonymous (read-only guest mode) |
| Themes | 9 built-in themes + AI-generated custom themes; premium gating on Pro/Studio |
| Portfolio renderer | Three public theme layouts: Freelancer, Agency, Stylish Portfolio |

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | ShadCN UI + Tailwind CSS v3 |
| Backend / DB | Firebase — Auth, Firestore, Storage, App Hosting |
| AI | Genkit 1.x + Google AI (Gemini) |
| Payments | Stripe (Checkout, Billing Portal, webhooks) |
| Testing | Vitest + React Testing Library + Playwright |

---

## Project structure

```
src/
├── ai/
│   ├── flows/          # Genkit AI flows (cv-parser, github-importer, …)
│   ├── genkit.ts       # Single ai instance + z re-export
│   └── dev.ts          # Genkit dev server entry
├── app/
│   ├── api/            # Next.js API routes (AI, Stripe, contact)
│   ├── dashboard/      # App shell pages
│   ├── portfolio/      # Public portfolio renderer ([userId])
│   └── …               # landing, pricing, login, signup, legal pages
├── components/         # Shared React components + ShadCN ui/
├── firebase/           # Client init, provider, hooks (useUser, useDoc, …)
├── hooks/              # use-mobile, use-toast, use-translation
├── lib/                # types, utils, theme-schema, stripe, logger, web-vitals
└── telemetry/          # OpenTelemetry server init
tests/
├── unit/               # Vitest — pure utility functions
├── frontend/           # Vitest + React Testing Library — component tests
├── e2e/                # Playwright — full browser flows
├── contract/           # Placeholder — API contract tests
└── performance/        # Placeholder — load / Lighthouse tests
```

---

## Local setup

### Prerequisites

- Node.js 20+
- `pnpm` (recommended) or `npm`
- A Firebase project with Auth, Firestore, and Storage enabled
- A Stripe account (test mode is fine for development)

### 1 — Clone and install

```bash
git clone https://github.com/your-username/portfolioforge.git
cd portfolioforge
pnpm install
```

### 2 — Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Firebase (client-side — all NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""

# Firebase App Check (optional in dev, required in prod)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=""

# Firebase Admin SDK (server-side only)
FIREBASE_SERVICE_ACCOUNT_KEY=""   # JSON string of your service account key

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_PRO_MONTHLY="price_..."
STRIPE_PRICE_STUDIO_MONTHLY="price_..."
```

### 3 — Start the dev server

```bash
pnpm dev          # Next.js on http://localhost:3000 (Turbopack)
```

To also run the Genkit AI dev UI:

```bash
pnpm genkit:dev   # Genkit dev server (separate terminal)
```

### 4 — Stripe webhooks (local)

Forward Stripe events to your local server using the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Available scripts

| Script | Description |
|---|---|
| `pnpm dev` | Next.js dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript type check (no emit) |
| `pnpm test` | Vitest unit + component tests |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:ui` | Vitest with browser UI |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm genkit:dev` | Genkit AI dev server |
| `pnpm predeploy` | lint + typecheck + build (runs before deploy) |
| `pnpm deploy:prod` | `firebase deploy --only hosting` |

---

## Deployment

### Firebase App Hosting

```bash
pnpm predeploy    # lint, typecheck, build
pnpm deploy:prod  # firebase deploy --only hosting
```

Set the same environment variables in the Firebase App Hosting console (or `apphosting.yaml` secrets). Configure the Stripe webhook endpoint to:

```
https://<your-app>/api/stripe/webhook
```

---

## AI flows

All flows live in `src/ai/flows/` and are wired to API routes under `src/app/api/`.

| Flow | Route | Description |
|---|---|---|
| `cv-parser` | `/api/cv-parser` | Multi-modal CV/resume parsing (PDF or image) |
| `linkedin-parser` | `/api/linkedin-parser` | Parses raw LinkedIn profile text |
| `github-importer` | `/api/github-importer` | Fetches public repos + AI README summaries |
| `web-importer` | `/api/web-importer` | Crawls a URL and creates a portfolio item |
| `content-suggester` | `/api/content-suggester` | Improves user-written text |
| `ai-powered-content-suggestions` | `/api/ai/ai-powered-content-suggestions` | Generates portfolio headline + summary |
| `theme-generator` | `/api/theme-generator` | Generates a full theme config from a text prompt |
| `translator` | `/api/translate` | Translates portfolio content |

All flows use `ai.generate()` with structured Zod output schemas and import `z` from `@/ai/genkit` (not directly from `genkit` or `zod`).

---

## Subscription plans

| Feature | Free | Pro ($12/mo) | Studio ($29/mo) |
|---|---|---|---|
| Portfolio items | 3 | Unlimited | Unlimited |
| Standard themes | ✅ | ✅ | ✅ |
| Premium themes | ❌ | ✅ | ✅ |
| Custom domain | ❌ | ✅ | ✅ |
| Remove branding | ❌ | ✅ | ✅ |
| AI theme generator | ❌ | ✅ | ✅ |
| Team collaboration | ❌ | ❌ | ✅ |

Plan gating is enforced both client-side (UI disabled states) and server-side (API routes check subscription tier before writing).

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow. The short version:

1. Fork → clone → `pnpm install`
2. Create a feature branch
3. Make changes, run `pnpm lint && pnpm typecheck && pnpm test`
4. Open a pull request with a clear description

---

## Licence

MIT
