# TODO

Open tasks for contributors, ordered by priority. Pick one, create a branch, and open a PR — see [CONTRIBUTING.md](./CONTRIBUTING.md) for the workflow.

---

## 🔴 High priority

### Provision Stripe secrets in Secret Manager
`apphosting.yaml` has the four Stripe variables defined but commented out. Until they are populated in Google Cloud Secret Manager and uncommented, all `/api/stripe/*` routes return HTTP 500.

- Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_STUDIO_MONTHLY` to Secret Manager for the `studio-3849653404-e5627` project.
- Uncomment the four secret entries in `apphosting.yaml`.
- Verify end-to-end with a Stripe test-mode checkout.

### Set up multi-environment Firebase projects
Currently dev, staging, and production all share the single `studio-3849653404-e5627` project. This means a bad deploy or a bad Firestore rule can affect real users.

- Create a separate Firebase project for `dev` (and optionally `staging`).
- Add the new project IDs to `.firebaserc` under named aliases (`dev`, `staging`, `prod`).
- Update CI to deploy to `dev` on branch pushes and `prod` on `main` merges.
- Document the multi-env setup in `docs/BACKEND_ARCHITECTURE.md`.

### Configure CI/CD deployment secrets
The GitHub Actions workflow exists but repository secrets are not yet set, so the deploy step never runs.

- Add the following secrets to the GitHub repository settings: `FIREBASE_SERVICE_ACCOUNT_KEY`, `GOOGLE_GENAI_API_KEY`, and the four Stripe secrets.
- Smoke-test the full `lint → typecheck → test → deploy` pipeline on a feature branch.

---

## 🟡 Medium priority

### Migrate portfolio page to Next.js 15 `params` pattern
`src/app/portfolio/[userId]/page.tsx` uses the deprecated `{ params: { userId } }` destructuring. Next.js 15 requires params to be awaited.

- Change the page signature to `async function Page({ params }: { params: Promise<{ userId: string }> })`.
- Await `params` before use: `const { userId } = await params`.
- Run `pnpm typecheck` to confirm no regressions.

### Set up Firebase console alerting
The structured logger (`src/lib/logger.ts`) and Firebase Performance are in place but no alerts are configured, so errors are silent in production.

- Create a Cloud Monitoring alerting policy for error-level log entries.
- Create a Firebase Performance alert for p75 page load > 3 s.
- Document the alert thresholds in `docs/BACKEND_ARCHITECTURE.md`.

### Implement API contract tests
`tests/contract/placeholder.test.ts` is a placeholder. Contract tests would catch breaking changes to AI route request/response shapes before they reach production.

- Write request/response schema tests for at least `/api/cv-parser` and `/api/portfolio-items` using Zod `.parse()` against fixture payloads.
- Wire them into `pnpm test` so they run in CI.

---

## 🟢 Low priority

### Fix avatar fallback in portfolio themes
Public portfolio pages fall back to a random `picsum.photos` image when no avatar is set. This looks unprofessional and changes on every render.

- Use `user.photoURL` from Firebase Auth as the primary source.
- Fall back to a deterministic UI-avatar (initials-based) using the user's `fullName` or email prefix.

### Replace placeholder footer social links
The landing page footer has Twitter, GitHub, and LinkedIn links pointing to `#`.

- Replace with real URLs or remove the links entirely.
- If kept, open them in a new tab (`target="_blank" rel="noopener noreferrer"`).

### Implement performance test suite
`tests/performance/placeholder.test.ts` is a placeholder.

- Add a Lighthouse CI config (`.lighthouserc.js`) targeting the public landing page and a portfolio page.
- Set budget thresholds: LCP < 2.5 s, CLS < 0.1, TBT < 200 ms.
- Optionally add a k6 script for load-testing `/api/portfolio-items`.

### Implement contract test suite
Expand `tests/contract/` beyond the placeholder:

- `/api/cv-parser` — assert the response matches the `UserProfile` partial schema.
- `/api/portfolio-items` — assert 403 for free-plan users at item 4, 201 for item 1–3.
- `/api/stripe/webhook` — assert correct Firestore writes for each event type using a mock Stripe payload.

---

## 💡 Feature ideas

These are not bugs or tech debt — they are new capabilities aligned with the product roadmap.

- **Email notifications** — notify portfolio owners when a new contact message arrives (Cloud Functions + SendGrid / Resend).
- **Custom domain DNS verification** — automate the `customDomainStatus` flow: poll DNS, flip status to `active` when the CNAME resolves.
- **Multiple portfolios (Studio plan)** — the data model supports it via sub-collections; the UI and routing need to be built out.
- **Team collaboration (Studio plan)** — invite team members to co-edit a portfolio; requires a `members` sub-collection and updated Firestore rules.
- **Portfolio analytics** — page view counts per portfolio using Firebase Analytics or a lightweight Firestore counter.
- **Dark mode toggle** — the theme system supports `dark` palettes; expose a user-facing toggle in the settings page.
