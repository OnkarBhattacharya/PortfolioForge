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
3. **Install dependencies** (pnpm is preferred):
   ```bash
   pnpm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Fill in Firebase, Google AI, and Stripe credentials — see README for details
   ```
5. **Start the dev server**:
   ```bash
   pnpm dev
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
   pnpm lint          # ESLint
   pnpm typecheck     # TypeScript (no emit)
   pnpm test          # Vitest unit + component tests
   ```
4. For end-to-end tests (requires Playwright browsers installed once via `npx playwright install`):
   ```bash
   pnpm test:e2e
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
├── ai/
│   ├── flows/          # Genkit AI flows — one file per capability
│   ├── genkit.ts       # Shared ai instance; always import z from here
│   └── dev.ts          # Genkit dev server entry point
├── app/
│   ├── api/            # Next.js API routes (AI endpoints, Stripe, portfolio-items, contact)
│   ├── dashboard/      # Authenticated app pages
│   ├── portfolio/      # Public portfolio renderer
│   └── …               # Public pages (landing, pricing, login, signup, legal)
├── components/
│   ├── ui/             # ShadCN UI primitives (do not edit directly)
│   └── …               # Shared layout and feature components
├── firebase/           # Firebase client init, context provider, hooks
├── hooks/              # Custom React hooks
├── lib/                # Utilities, types, theme schema, Stripe helpers, logger
└── telemetry/          # OpenTelemetry server-side init
tests/
├── unit/               # Pure utility function tests (Vitest)
├── frontend/           # Component tests (Vitest + React Testing Library)
├── e2e/                # Browser automation (Playwright)
├── contract/           # API contract tests (placeholder)
└── performance/        # Load / Lighthouse tests (placeholder)
```

---

## Coding standards

- **Style**: Follow the existing code style. Run `pnpm lint` before committing.
- **TypeScript**: All new code must be typed. Run `pnpm typecheck` to verify.
- **Imports**: Always import `z` from `@/ai/genkit`, never directly from `genkit` or `zod`.
- **AI flows**: Use `ai.generate()` with a Zod `output.schema` — do not use `ai.definePrompt` with Handlebars templates.
- **Design tokens**: Use Tailwind design-system tokens (`bg-background`, `text-foreground`, etc.) — never raw colour classes like `bg-gray-100` or `bg-white`.
- **Hooks**: Never call React hooks after an early `return`. All hooks must be at the top of the component.
- **No dummy data**: Do not commit hardcoded placeholder data in pages. Use empty states and loading skeletons instead.
- **Portfolio item creation**: Always route through `POST /api/portfolio-items` — never write directly from the client. This enforces the free-plan limit server-side.
- **Comments**: Write self-documenting code. Add comments only where the *why* is non-obvious.
- **Tests**: Add tests for new features or bug fixes. Do not remove existing tests.

---

## Adding a new AI flow

1. Create `src/ai/flows/my-flow.ts`:
   ```typescript
   import { ai, z } from '@/ai/genkit';

   const InputSchema = z.object({ … });
   const OutputSchema = z.object({ … });

   export async function myFlow(input: z.infer<typeof InputSchema>) {
     return myFlowDef(input);
   }

   const myFlowDef = ai.defineFlow(
     { name: 'myFlow', inputSchema: InputSchema, outputSchema: OutputSchema },
     async (input) => {
       const { output } = await ai.generate({
         prompt: `…${input.someField}…`,
         output: { schema: OutputSchema },
       });
       if (!output) throw new Error('Model returned no output');
       return output;
     }
   );
   ```
2. Create the API route at `src/app/api/my-flow/route.ts`.
3. Register the flow in `src/ai/dev.ts` if you want it visible in the Genkit dev UI.

---

## Pull request checklist

- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm typecheck` passes with no errors
- [ ] `pnpm test` passes
- [ ] No hardcoded dummy/placeholder data in UI
- [ ] Design-system tokens used (no raw gray/white classes)
- [ ] Portfolio item creation goes through `/api/portfolio-items`
- [ ] PR description explains *what* changed and *why*

---

We review pull requests as quickly as we can. Thank you for contributing!
