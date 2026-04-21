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
pnpm test           # run once
pnpm test:watch     # watch mode — re-runs on file save
pnpm test:ui        # Vitest browser UI
```

These tests run in jsdom and are fast. They cover utility functions and React components in isolation.

### End-to-end tests

```bash
# First time only — install browser binaries
npx playwright install

pnpm test:e2e
```

E2E tests run in a real Chromium (and optionally Firefox/WebKit) browser. They cover critical user journeys end-to-end.

### Type checking (not a test runner, but part of CI)

```bash
pnpm typecheck      # tsc --noEmit
```

### Full pre-deploy check

```bash
pnpm predeploy      # lint + typecheck + build
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

Renders the dashboard page with React Testing Library. Mocks Firebase hooks and `localStorage` to test:

- Guest (anonymous) user sees the Read-Only Mode banner.
- Authenticated user sees the Profile Status checklist.
- Loading state renders skeletons.

### `tests/frontend/admin.test.tsx`

Renders the admin page and verifies access control — non-admin users are redirected or shown an access-denied state.

### `tests/e2e/auth.spec.ts`

Playwright tests covering:

- Landing page loads and CTAs are visible.
- Sign-up and login pages render correctly.
- Cookie consent banner appears and can be dismissed.
- Navigation to legal pages (Terms, Privacy, Cookie Policy) from the footer.

### `tests/contract/placeholder.test.ts`

Placeholder describing future contract tests that will verify the request/response schema between the frontend and AI API routes (e.g. `/api/cv-parser` input/output shape).

### `tests/performance/placeholder.test.ts`

Placeholder describing future performance tests using k6 (API load testing) and Lighthouse (page speed / Core Web Vitals).

---

## Mocking strategy

All Firebase dependencies are mocked in `tests/setup.ts`, which Vitest loads automatically via `setupFiles` in `vite.config.ts`.

Example — simulating different auth states:

```typescript
import { vi } from 'vitest';

vi.mock('@/firebase', () => ({
  useUser: vi.fn(() => ({
    user: { uid: 'test-uid', isAnonymous: false, email: 'test@example.com' },
    isUserLoading: false,
    userError: null,
  })),
  useFirestore: vi.fn(() => ({})),
  useMemoFirebase: vi.fn((factory) => factory()),
  useCollection: vi.fn(() => ({ data: [], isLoading: false })),
  useDoc: vi.fn(() => ({ data: null, isLoading: false })),
}));
```

To simulate a guest user, override `useUser` to return `{ user: { isAnonymous: true }, isUserLoading: false }`.

---

## Continuous integration

GitHub Actions runs the full check suite on every push and pull request:

```
lint → typecheck → test (Vitest) → test:e2e (Playwright)
```

The CI configuration lives in `.github/workflows/ci.yml`. Repository secrets must be configured for Firebase and Stripe credentials before deployment steps will work.

---

## Current status

| Suite | Status |
|---|---|
| Unit (`tests/unit/`) | Active — runs with `pnpm test` |
| Frontend (`tests/frontend/`) | Active — runs with `pnpm test` |
| E2E (`tests/e2e/`) | Active — runs with `pnpm test:e2e` after `npx playwright install` |
| Contract (`tests/contract/`) | Placeholder — not yet implemented |
| Performance (`tests/performance/`) | Placeholder — not yet implemented |
