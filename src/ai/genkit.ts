/**
 * @fileOverview Centralized Genkit AI configuration and initialization.
 *
 * Exports `getAi()` instead of a bare singleton so that `genkit()` and
 * `googleAI()` are never called at module-load time. App Hosting injects
 * secrets at runtime; reading `process.env.GOOGLE_GENAI_API_KEY` during the
 * Next.js cold-start module-evaluation phase would capture `undefined` and
 * cache it permanently. `getAi()` is called inside flow functions, which only
 * run after the runtime environment is fully initialised.
 */

import { genkit, type Genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import { z } from 'zod';

let _ai: Genkit | undefined;

export function getAi(): Genkit {
  if (!_ai) {
    enableFirebaseTelemetry();
    _ai = genkit({ plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })] });
  }
  return _ai;
}

export { z };
