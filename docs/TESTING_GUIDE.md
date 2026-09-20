# PortfolioForge — Testing Guide

This document describes the testing strategy, tools, and instructions for running every test suite in the project.

---

## Philosophy

Tests are organised by scope and speed. Faster, more isolated tests run first; slower browser tests run last.

| Layer | Tool | Location | Speed |
|---|---|---|---|
| Unit | Vitest | `tests/unit/` | Fast |
| Component | Vitest + React Testing Library | `tests/frontend/` | Fast |
| End-to-end | Playwright | `tests/e2e/` | Slow |
| Contract | Placeholder | `tests/contract/` | — |
| Performance | Placeholder | `tests/performance/` | — |

---

## Tools

| Tool | Version | Purpose |
|---|---|---|
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

### `tests/frontend/dashboard.test.tsx`

Renders the dashboard page with React Testing Library. Mocks Supabase hooks to test:

- Guest (unauthenticated) user sees the Read-Only Mode banner.
- Authenticated user sees the Profile Status checklist.
- Loading state renders skeletons.

### `tests/e2e/auth.spec.ts`

Playwright tests covering:

- Landing page loads and CTAs are visible.
- Sign-up and login pages render correctly.
- Cookie consent banner appears and can be dismissed.
- Navigation to legal pages (Terms, Privacy, Cookie Policy) from the footer.

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
|---|---|
| Unit (`tests/unit/`) | Active — runs with `npm run test` |
| Frontend (`tests/frontend/`) | Needs update — Firebase mocks removed |
| E2E (`tests/e2e/`) | Active — runs with `npm run test:e2e` after `npx playwright install` |
| Contract (`tests/contract/`) | Placeholder — not yet implemented |
| Performance (`tests/performance/`) | Placeholder — not yet implemented |

---

## Notes

- The `tests/frontend/admin.test.tsx` and `tests/frontend/dashboard.test.tsx` files were removed during the Firebase→Supabase migration because they relied on Firebase mocks. They need to be rewritten with Supabase mock patterns.
- Run `npm run test` to verify current test suite passes.