# PortfolioForge — Product Blueprint

## App name

PortfolioForge

---

## Core features

### Data import
- **CV upload & parsing** — Upload a PDF or image; a multi-modal OpenRouter flow (Llama 3.2 Vision) extracts name, summary, experience, education, skills, and profession.
- **LinkedIn import** — Paste raw LinkedIn profile text; AI infers the same structured fields (Llama 3.1).
- **GitHub project import** — Fetch up to 10 public repos per user, generate AI README summaries via OpenRouter, and seed portfolio items automatically.
- **URL importer** — Crawl any public URL, clean the HTML, and create a portfolio item with AI-crafted tags and description (Llama 3.1 / Phi-3 Mini).

### AI content
- **Content suggester** — Inline AI rewrites for any text field (project descriptions, summaries).
- **Portfolio content assistant** — Generates a portfolio headline and professional summary from all imported data combined.
- **AI theme generator** — Describe a style in plain text; OpenRouter returns a full `ThemeConfig` (light + dark palettes, fonts, border radius).
- **Translator** — Translates portfolio content into other languages.
- **README Summarization** — 1-2 sentence repo summaries for GitHub imports.

### Portfolio & themes
- **4 built-in themes** — Minimal, Developer, Creative, Dark; stored in Supabase `themes` table.
- **3 public portfolio layouts** — Freelancer, Agency, Stylish Portfolio; selected via `theme_id` on the user profile.
- **AI-generated custom themes** — Stored as `custom_theme` on the user profile; applied at render time via CSS custom properties.
- **Theme preview dialog** — Full-page preview before saving.

### Monetisation
- **Free plan** — 3 portfolio items, standard themes, hosted on `portfolioforge.app`.
- **Pro plan ($12/mo)** — Unlimited items, premium themes, custom domain, remove branding, AI theme generator.
- **Studio plan ($29/mo)** — Everything in Pro plus multiple portfolios, client-ready case study layouts, team collaboration.
- **Stripe Checkout** — `/api/stripe/checkout` creates a Checkout session for Pro or Studio.
- **Stripe Billing Portal** — `/api/stripe/portal` opens the customer portal for plan management.
- **Webhook sync** — `/api/stripe/webhook` listens for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed` and writes `subscription_tier`, `subscription_status`, `subscription_period_end_date` to Supabase `profiles`.

### Auth & access control
- Google, Apple, GitHub federated sign-in via Supabase Auth (OAuth + Magic Links).
- Email/Password authentication.
- Anonymous/read-only mode for unauthenticated users (UI shows read-only banners).
- All authenticated app pages redirect to `/login` if no session.
- Free-plan item limit enforced both client-side (UI disabled) and server-side (`POST /api/portfolio-items` checks tier; RLS blocks direct writes).
- Admin panel at `/admin` visible only to users with `role: 'admin'` in Supabase.

### Admin
- Admin panel at `/admin` — lists all users with subscription tier, status, and role.

---

## Technology stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15, App Router, Turbopack |
| Language | TypeScript 5 |
| UI components | ShadCN UI (Radix primitives) |
| Styling | Tailwind CSS v3, CSS custom properties for theming |
| Backend | Next.js API routes (serverless functions) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| File storage | Supabase Storage |
| Hosting | Vercel |
| AI runtime | OpenRouter (free models: Llama 3.2 Vision, Llama 3.1, Gemma 2, Phi-3 Mini) |
| AI abstraction | Custom `OpenRouterAI` class with fallback chains + Zod validation |
| Payments | Stripe |
| Observability | Vercel Analytics, Core Web Vitals, OpenTelemetry (server), structured logger |
| Testing | Vitest, React Testing Library, Playwright |

---

## Style guidelines

- **Primary colour**: Deep Indigo `hsl(231 48% 48%)` — professionalism and innovation.
- **Accent colour**: Teal `hsl(174 100% 29%)` — interactive elements and CTAs.
- **Background**: Light grey `hsl(220 13% 95%)` — clean, modern backdrop.
- **Headline font**: Space Grotesk — techy, modern feel.
- **Body font**: Inter — clean, readable.
- **Border radius**: `0.5rem` default; overridable per theme.
- **Layout**: Responsive grid; mobile-first breakpoints via Tailwind.
- **Animations**: Subtle `fade-up` and `float-slow` keyframes; no motion for decorative elements on reduced-motion.
- **Design tokens**: All colours referenced via CSS custom properties (`hsl(var(--primary))`). Raw Tailwind colour classes (`bg-gray-*`, `bg-white`) are not used in app UI.

---

## Current status

- All public pages (landing, pricing, legal) are live and production-ready.
- All app shell pages (dashboard, portfolio items, AI assistant, billing, settings, import-data, admin) connected to Supabase with real data.
- All AI flows use OpenRouter free models with structured Zod schemas and fallback chains.
- Portfolio item creation routed through `POST /api/portfolio-items` (Supabase server client); direct client creates blocked by RLS.
- Stripe Checkout / Portal / webhook and Supabase RLS enforce monetisation commitments.
- React hydration stable: Supabase SSR auth via `@supabase/ssr` middleware eliminates SSR/client mismatch.
- `tsconfig.json` uses `moduleResolution: bundler`; deprecated `baseUrl` removed.
- Vercel deployment configured with 30s function timeout for AI routes.