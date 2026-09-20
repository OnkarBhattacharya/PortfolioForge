# Archived Documentation

These documents describe the **legacy Firebase + Genkit implementation** and the **migration plan** to the current Supabase + OpenRouter stack. They are preserved for historical reference only.

## Archived Files

| File | Description | Why Archived |
|------|-------------|--------------|
| `TODO.md` | Task list for fixing Firebase/Genkit console errors | Migration complete; issues resolved in new stack |
| `MIGRATION_PLAN.md` | Detailed plan for Firebase→Supabase migration | Migration **completed** — current implementation matches target |
| `firebase_production_audit_report.md` | Firebase production audit (Jan 2025) | Audited legacy Firebase stack; no longer applicable |
| `backend.json` | Firebase-era backend spec (Firestore paths, Firebase Auth providers) | Superseded by Supabase schema + `BACKEND_ARCHITECTURE.md` |

## Current Implementation

See **[README.md](../README.md)** (root) for the single source of truth on the current Supabase + OpenRouter architecture.

Active documentation:
- `../blueprint.md` — Product blueprint (features, stack, status)
- `../BACKEND_ARCHITECTURE.md` — Technical reference (data models, API, auth, AI, Stripe)
- `../TESTING_GUIDE.md` — Testing strategy and commands
- `../DEPLOYMENT_GUIDE.md` — Production runbook (Vercel project `portfolio-forge`)

---

**Note**: The migration from Firebase + Genkit → Supabase + OpenRouter is complete. All features now run on the new stack with free OpenRouter models.