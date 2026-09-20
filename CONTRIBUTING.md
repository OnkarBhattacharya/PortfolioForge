# Contributing to PortfolioForge

Thank you for taking the time to contribute. All help is welcome — bug reports, feature ideas, documentation fixes, and code changes.

---

## Getting started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/portfolioforge.git
   cd portfolioforge
   ```
3. **Install dependencies** (npm — the repo ships a package-lock.json):
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Fill in Supabase, OpenRouter, and Stripe credentials — see README for details
   ```
5. **Set up Supabase** (local or cloud):
   - Local: `npx supabase start` (requires Docker)
   - Cloud: Create project at supabase.com, run migrations
6. **Start the dev server**:
   ```bash
   npm run dev
   ```

---

## Reporting bugs

Open a GitHub issue and include:

- A clear, descriptive title.
- Steps to reproduce the problem.
- Expected vs. actual behaviour.
- Browser / OS / Node version if relevant.

---

## Suggesting features

Open a GitHub issue describing:

- What the feature does.
- Why it is valuable to PortfolioForge users.
- Any implementation ideas you have.

---

## Development workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   # or
   git checkout -b fix/my-bug
   ```
2. Make your changes.
3. Run the full check suite before committing:
   ```bash
   npm run lint          # ESLint
   npm run typecheck     # TypeScript (no emit)
   npm run test          # Vitest unit + component tests
   ```
4. For end-to-end tests (requires Playwright browsers installed once via `npx playwright install`):
   ```bash
   npm run test:e2e
   ```
5. Commit with a meaningful message:
   ```bash
   git commit -m "feat: add dark mode toggle to settings page"
   ```
6. Push and open a pull request against `main`.

---

## Folder structure

```
src/
├── app/
│   ├── api/            # Next.js API routes (AI endpoints, Stripe, portfolio-items, contact)
│   ├── auth/callback/  # Supabase OAuth callback route (code exchange, honors ?next=)
│   ├── dashboard/      # Authenticated app pages
│   ├── portfolio/      # Public portfolio renderer
│   ├── admin/          # Admin panel
│   ├── import-data/    # Data import UI
│   ├── ai-assistant/   # AI content assistant
│   ├── billing/        # Stripe billing UI
│   ├── settings/       # User settings
│   └── …               # Public pages (landing, pricing, login, signup, legal)
├── components/
│   ├── ui/             # ShadCN UI primitives (do not edit directly)
│   └── …               # Shared layout and feature components
├── hooks/
│   └── use-supabase.ts # useUser(), useSupabase(), useAuth()
├── lib/
│   ├── supabase/       # Supabase clients (browser, server, middleware)
│   ├── ai/
│   │   └── openrouter.ts  # OpenRouterAI class with fallback chains
│   ├── stripe.ts           # Stripe instance (lazy proxy)
│   ├── logger.ts           # Structured JSON logger
│   ├── utils.ts            # cn() helper, etc.
│   └── ...                 # data, theme-schema, web-vitals
├── middleware.ts       # Route protection (Supabase SSR)
├── telemetry/
│   └── init.ts         # OpenTelemetry server init
└── types/index.ts      # Zod schemas + TS types for all data models
tests/
├── unit/               # Pure utility function tests (Vitest)
├── frontend/           # Component tests (Vitest + React Testing Library)
├── e2e/                # Browser automation (Playwright)
├── contract/           # API contract tests (placeholder)
└── performance/        # Load / Lighthouse tests (placeholder)
```

---

## Coding standards

- **Style**: Follow the existing code style. Run `npm run lint` before committing.
- **TypeScript**: All new code must be typed. Run `npm run typecheck` to verify.
- **Imports**: Import Supabase clients from `@/lib/supabase/client` (browser) or `@/lib/supabase/server` (server). Import AI from `@/lib/ai/openrouter`.
- **AI flows**: Use `OpenRouterAI` class methods — do not call OpenRouter API directly. All responses validated with Zod schemas.
- **Design tokens**: Use Tailwind design-system tokens (`bg-background`, `text-foreground`, etc.) — never raw colour classes like `bg-gray-100` or `bg-white`.
- **Hooks**: Never call React hooks after an early `return`. All hooks must be at the top of the component.
- **No dummy data**: Do not commit hardcoded placeholder data in pages. Use empty states and loading skeletons instead.
- **Portfolio item creation**: Always route through `POST /api/portfolio-items` — never write directly from the client. Note: the route currently validates auth + schema only; the free-plan 3-item limit is enforced client-side (UI), and RLS enforces owner-only writes. Do not claim server-side tier gating until it is implemented.
- **Comments**: Write self-documenting code. Add comments only where the *why* is non-obvious.
- **Tests**: Add tests for new features or bug fixes. Do not remove existing tests.
- **Supabase RLS**: All database writes must respect RLS. Use service role client only in API routes for admin operations.

---

## Adding a new AI feature

1. Add Zod schemas to `src/types/index.ts` (all models live there — there is no `src/lib/schemas.ts`):
   ```typescript
   export const MyFeatureInputSchema = z.object({ … });
   export const MyFeatureOutputSchema = z.object({ … });
   ```
2. Add method to `OpenRouterAI` class in `src/lib/ai/openrouter.ts`:
   ```typescript
   async myFeature(userId: string, input: z.infer<typeof MyFeatureInputSchema>) {
     if (!(await this.checkRateLimit(userId, 'my_feature'))) {
       throw new Error('Rate limit exceeded');
     }
     return this.callModel({
       model: FREE_MODELS.TEXT,
       messages: [
         { role: 'system', content: MY_FEATURE_PROMPT },
         { role: 'user', content: JSON.stringify(input) },
       ],
       responseSchema: MyFeatureOutputSchema,
     });
   }
   ```
3. Create API route at `src/app/api/ai/my-feature/route.ts`:
   ```typescript
   import { openRouterAI } from '@/lib/ai/openrouter';
   import { MyFeatureInputSchema } from '@/types';
   
   export async function POST(req: Request) {
     const user = await getUserFromRequest(req); // validate auth
     const body = MyFeatureInputSchema.parse(await req.json());
     const result = await openRouterAI.myFeature(user.id, body);
     return Response.json(result);
   }
   ```
4. Add rate limit key to `FREE_MODELS` usage tracking in `ai_usage` table.

---

## Pull request checklist

- [ ] `npm run lint` passes with no errors
- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run test` passes
- [ ] No hardcoded dummy/placeholder data in UI
- [ ] Design-system tokens used (no raw gray/white classes)
- [ ] Portfolio item creation goes through `/api/portfolio-items`
- [ ] New AI features use `OpenRouterAI` class with Zod validation
- [ ] Supabase RLS respected (no direct client writes to protected tables)
- [ ] PR description explains *what* changed and *why*

---

## Architecture Notes

### Current Stack (Post-Migration)
- **Database**: Supabase (PostgreSQL) with RLS
- **Auth**: Supabase Auth (Google, GitHub, Magic Links, Email/Password)
- **AI**: OpenRouter free models via custom `OpenRouterAI` abstraction
- **Payments**: Stripe Checkout + Billing Portal + Webhooks (card + optional PayPal via `STRIPE_PAYMENT_METHODS`)
- **Hosting**: Vercel (`portfolio-forge` → `https://portfolio-forge-beige.vercel.app`)

### Removed (Legacy Firebase/Genkit)
- `src/firebase/` — entire directory
- `src/ai/flows/` — Genkit flows
- `src/app/api/[[...genkit]]/` — Genkit dev UI
- Firebase config files: `firebase.json`, `firestore.rules`, `storage.rules`, `.firebaserc`
- Firebase App Hosting: `.apphosting.yaml`, `.apphosting.emulator.yaml`
- Dependencies: `firebase`, `firebase-admin`, `genkit`, `@genkit-ai/*`

---

We review pull requests as quickly as we can. Thank you for contributing!