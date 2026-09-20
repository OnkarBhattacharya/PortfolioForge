# PortfolioForge — Testing Guide

This document describes the testing strategy, tools, and instructions for running every test suite in the project.

---

## Philosophy

Tests are organised by scope and speed. Faster, more isolated tests run first; slower browser tests run last.

| Layer | Tool | Location | Speed |
|-------|------|----------|-------|
| Unit | Vitest | `tests/unit/` | Fast |
| Component | Vitest + React Testing Library | `tests/frontend/` | Fast |
| End-to-end | Playwright | `tests/e2e/` | Slow |
| Contract | Placeholder | `tests/contract/` | — |
| Performance | Placeholder | `tests/performance/` | — |

---

## Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | ^4.x | Unit and component test runner |
| **React Testing Library** | ^16.x | Component rendering and interaction |
| **@testing-library/jest-dom** | ^6.x | Custom DOM matchers |
| **jsdom** | ^27.x | Simulated browser environment for Vitest |
| **Playwright** | ^1.45.x | Real-browser end-to-end tests |
| **TypeScript** | ^5.x | Static type checking (catches errors before runtime) |

---

## Running tests

### Unit and component tests

```bash
npm run test           # run once
npm run test:watch     # watch mode — re-runs on file save
npm run test:ui        # Vitest browser UI
```

These tests run in jsdom and are fast. They cover utility functions and React components in isolation.

### End-to-end tests

```bash
# First time only — install browser binaries
npx playwright install

npm run test:e2e
```

E2E tests run in a real Chromium (and optionally Firefox/WebKit) browser. They cover critical user journeys end-to-end.

### Type checking (not a test runner, but part of CI)

```bash
npm run typecheck      # tsc --noEmit
```

### Full pre-deploy check

```bash
npm run predeploy      # lint + typecheck + build
```

---

## Test files

### `tests/unit/utils.test.ts`

Tests for pure utility functions in `src/lib/utils.ts`, primarily the `cn` class-name helper.

```typescript
import { cn } from '@/lib/utils';
it('merges class names', () => {
  expect(cn('a', 'b')).toBe('a b');
});
```

### `tests/frontend/` (empty — needs tests)

The directory exists but contains no test files (the old `dashboard.test.tsx` / `admin.test.tsx` were removed during the Firebase→Supabase migration and never rewritten). Priority additions:

- Dashboard page: guest sees Read-Only banner; authenticated user sees Profile Status checklist; loading state renders skeletons.
- Login/signup pages: Google OAuth button renders; Apple button is gone.
- Billing page: plan cards + portal button render for the current tier.

Use the Supabase mock pattern from `tests/setup.ts` (see Mocking strategy below).

### `tests/e2e/auth.spec.ts` (stale — needs rewrite)

The spec exists but tests an **email/password signup flow that no longer exists** (it fills "Full Name / Email / Password" fields; login/signup are now OAuth-buttons-only), so it currently fails. It also covers admin access-denied and legal-footer navigation, which are still valid scenarios. Rewrite plan:

- Replace email/password flows with OAuth-aware flows (mock Supabase session or seed a test user via service role).
- Keep admin-denied + legal-link tests, updated to current routes (`/terms-and-conditions`, `/privacy-policy`, `/cookie-policy`).

⚠️ Config mismatch: `playwright.config.ts` serves `http://localhost:9002` but `npm run dev` defaults to port 3000 — set `PORT=9002` when running e2e, or align the config, or the webServer wait times out.

### `tests/contract/placeholder.test.ts`

Placeholder describing future contract tests that will verify the request/response schema between the frontend and API routes (e.g. `/api/ai/cv-parse`, `/api/portfolio-items` input/output shape).

### `tests/performance/placeholder.test.ts`

Placeholder describing future performance tests using k6 (API load testing) and Lighthouse (page speed / Core Web Vitals).

---

## Mocking strategy

All Supabase dependencies are mocked in `tests/setup.ts`, which Vitest loads automatically via `setupFiles` in `vite.config.ts`.

Example — simulating different auth states:

```typescript
import { vi } from 'vitest';

vi.mock('@/hooks/use-supabase', () => ({
  useUser: vi.fn(() => ({
    user: { id: 'test-uid', email: 'test@example.com', isAnonymous: false },
    isUserLoading: false,
    userError: null,
  })),
  useSupabase: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
  })),
  useAuth: vi.fn(() => ({
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
  })),
}));

vi.mock('lucide-react', () => new Proxy({}, {
  get: (_, prop) => (props: any) => <div data-testid={`mock-icon-${String(prop)}`} {...props} />,
}));
```

To simulate a guest user, override `useUser` to return `{ user: null, isUserLoading: false, userError: null }`.

### Mocking OpenRouter AI

For component tests that use AI features, mock the API response:

```typescript
vi.mock('@/lib/ai/openrouter', () => ({
  openRouterAI: {
    suggestContent: vi.fn().mockResolvedValue({
      headline: 'Test Headline',
      summary: 'Test Summary',
    }),
    // ... other methods
  },
}));
```

---

## Continuous integration

GitHub Actions runs the full check suite on every push and pull request:

```
lint → typecheck → test (Vitest) → test:e2e (Playwright)
```

The CI configuration lives in `.github/workflows/ci.yml`. Repository secrets must be configured for Supabase, OpenRouter, and Stripe credentials before deployment steps will work.

---

## Current status

| Suite | Status |
|-------|--------|
| Unit (`tests/unit/utils.test.ts`) | Active — runs with `npm run test` |
| Frontend (`tests/frontend/`) | Empty — no test files; needs rewrite with Supabase mocks |
| E2E (`tests/e2e/auth.spec.ts`) | Stale — specs target the removed email/password flow; needs rewrite for OAuth-only UI |
| Contract (`tests/contract/`) | Placeholder — not yet implemented |
| Performance (`tests/performance/`) | Placeholder — not yet implemented |

---

## Notes

- Run `npm run test` to verify current test suite passes (unit only, until frontend tests are rewritten).
- Component tests should use Supabase mock patterns (see `tests/setup.ts`).
- E2E tests require `PORT=9002 npm run dev` (or fix the port mismatch in `playwright.config.ts`) — and rewritten specs (see above).
- AI feature tests should mock `openRouterAI` to avoid external API calls.