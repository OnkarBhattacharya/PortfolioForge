# TODO Progress: Fixing Console Errors (500s & COOP)
Status: In Progress | Owner: BLACKBOXAI | Steps below.

## 1. ✅ Create TODO.md [DONE]

## 2. ✅ Code improvements [DONE]
All AI routes/flows updated with validation, logging, user-friendly errors.

## 3. 🔄 User Environment Setup [REQUIRED for prod]
- Get key: [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create Secret Manager secret `GOOGLE_GENAI_API_KEY` (project: studio-3849653404-e5627).
- `apphosting.yaml` already mounts it ✓
- GitHub Secrets: `GOOGLE_GENAI_API_KEY` for CI.

## 4. 🧪 Test Commands
gcloud init
## 4. 🧪 Test
- Local: Set env var, `pnpm dev`, test APIs.
- Prod: Deploy, check console/Network.

## 5. ✅ Docs & cleanup
- Update README.md/docs/.
- Mark TODO items done.

Next step: Implement code changes.

