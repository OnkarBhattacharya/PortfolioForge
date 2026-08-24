## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🔑 Environment Variables (Production)

**Critical for AI features**: Set `GOOGLE_GENAI_API_KEY`.

### Firebase App Hosting (Prod)
1. Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Google Cloud Console → Secret Manager → Create secret `GOOGLE_GENAI_API_KEY`.
3. `apphosting.yaml` already mounts it → `firebase apps:deploy`.

### Local Dev
```
cp .env.example .env.local
# Edit .env.local with your GOOGLE_GENAI_API_KEY
npm run dev
```

### CI (GitHub Actions)
> **Note:** No CI workflow is currently checked in (`.github/workflows/` is absent).
> When adding one, store `GOOGLE_GENAI_API_KEY` under Repo Settings → Secrets.

See [TODO.md high priority](TODO.md#🔴-high-priority) for Stripe/Firestore setup.

## 🧪 Test APIs

All AI/portfolio APIs require a Firebase ID token (`Authorization: Bearer <idToken>`)
except the contact form. Examples:

```bash
# CV Parser
curl -X POST http://localhost:3000/api/cv-parser \
  -H "Authorization: Bearer $FIREBASE_ID_TOKEN" \
  -F 'file=@path/to/cv.pdf'

# Content Suggester
curl -X POST http://localhost:3000/api/content-suggester \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $FIREBASE_ID_TOKEN" \
  -d '{"text":"My project","contentType":"description"}'
```

## 📊 Console Errors Fixed
- **500 on AI APIs**: Clearer msgs; validate `GOOGLE_GENAI_API_KEY`.
- **COOP window.close**: Handled in `next.config.js`.

REST unchanged.

