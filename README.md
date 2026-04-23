## 🚀 Quick Start

```bash
pnpm i
pnpm dev
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
pnpm dev
```

### CI (GitHub Actions)
Repo Settings → Secrets → Add `GOOGLE_GENAI_API_KEY`.

See [TODO.md high priority](TODO.md#🔴-high-priority) for Stripe/Firestore setup.

## 🧪 Test APIs
```bash
# CV Parser
curl -X POST http://localhost:3000/api/cv-parser \
  -F 'cvFile=@path/to/cv.pdf' \
  -F 'userId=test-user'

# Content Suggester
curl -X POST http://localhost:3000/api/content-suggester \
  -H 'Content-Type: application/json' \
  -d '{"text":"My project","contentType":"description"}'
```

## 📊 Console Errors Fixed
- **500 on AI APIs**: Clearer msgs; validate `GOOGLE_GENAI_API_KEY`.
- **COOP window.close**: Handled in `next.config.js`.

REST unchanged.

