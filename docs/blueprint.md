# PortfolioForge — Product Blueprint

## App name

PortfolioForge

---

## Core features

### Data import
- **CV upload & parsing** — Upload a PDF or image; a multi-modal Genkit flow extracts name, summary, experience, education, skills, and profession.
- **LinkedIn import** — Paste raw LinkedIn profile text; AI infers the same structured fields.
- **GitHub project import** — Fetch up to 5 public repos per user, generate AI README summaries via the `readme-summarizer` flow, and seed portfolio items automatically.
- **URL importer** — Crawl any public URL, clean the HTML, and create a portfolio item with AI-crafted tags and description.

### AI content
- **Content suggester** — Inline AI rewrites for any text field (project descriptions, summaries).
- **Portfolio content assistant** — Generates a portfolio headline and professional summary from all imported data combined.
- **AI theme generator** — Describe a style in plain text; Genkit returns a full `ThemeConfig` (light + dark palettes, fonts, border radius).
- **Translator** — Translates portfolio content into other languages.

### Portfolio & themes
- **9 built-in themes** — Free and premium, stored in Firestore `/themes/`.
- **3 public portfolio layouts** — Freelancer, Agency, Stylish Portfolio; selected via `themeId` on the user profile.
- **AI-generated custom themes** — Stored as `customTheme` on the user document; applied at render time via CSS custom properties.
- **Theme preview dialog** — Full-page preview before saving.

### Monetisation
- **Free plan** — 3 portfolio items, standard themes, hosted on `portfolioforge.app`.
- **Pro plan ($12/mo)** — Unlimited items, premium themes, custom domain, remove branding, AI theme generator.
- **Studio plan ($29/mo)** — Everything in Pro plus multiple portfolios, client-ready case study layouts, team collaboration.
- **Stripe Checkout** — `/api/stripe/checkout` creates a Checkout session for Pro or Studio.
- **Stripe Billing Portal** — `/api/stripe/portal` opens the customer portal for plan management.
- **Webhook sync** — `/api/stripe/webhook` listens for `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted` events and writes `subscriptionTier`, `subscriptionStatus`, and `subscriptionPeriodEndDate` to Firestore.

### Auth & access control
- Google and Apple federated sign-in via Firebase Auth.
- Anonymous sign-in for read-only guest mode (no data saved).
- All authenticated app pages show a "Read-Only Mode" banner to anonymous users.
- Free-plan item limit enforced both client-side (UI disabled) and server-side (`POST /api/portfolio-items` checks tier before writing; direct client creates are blocked by Firestore rules).

### Admin
- Admin panel at `/admin` visible only to users with `role: 'admin'` in Firestore.

---

## Technology stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15, App Router, Turbopack |
| Language | TypeScript 5 |
| UI components | ShadCN UI (Radix primitives) |
| Styling | Tailwind CSS v3, CSS custom properties for theming |
| Backend | Next.js API routes |
| Database | Cloud Firestore |
| Auth | Firebase Authentication |
| File storage | Firebase Storage |
| Hosting | Firebase App Hosting |
| AI runtime | Genkit 1.x |
| AI model | Google AI — Gemini (via `@genkit-ai/google-genai`) |
| Payments | Stripe |
| Observability | Firebase Performance, Core Web Vitals, OpenTelemetry (server) |
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
- All app shell pages (dashboard, portfolio items, AI assistant, billing, settings) are connected to Firestore with real data — no dummy/placeholder data remains.
- All AI flows use `ai.generate()` with structured Zod schemas; `z` is always imported from `@/ai/genkit`.
- Portfolio item creation is routed through `POST /api/portfolio-items` (Admin SDK); direct client creates are blocked by Firestore rules.
- Stripe Checkout / Portal / webhook and Firestore rules enforce monetisation commitments. Stripe secrets are pending Secret Manager configuration for production.
- React hydration is stable: Firebase is initialised client-side via `useEffect`, eliminating the SSR/client mismatch (React error #418).
- Firebase Performance attribute length issue resolved by extracting long Tailwind class strings into named CSS utility classes.
- `tsconfig.json` uses `moduleResolution: bundler`; deprecated `baseUrl` removed.
- App Hosting configured with VPC connector (`managed-vpc`) and auto-scaling (1–10 instances).
