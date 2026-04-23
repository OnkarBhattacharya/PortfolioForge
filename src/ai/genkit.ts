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
let _aiKeySnapshot: string | undefined;
let _telemetryEnabled = false;

export function getAi(): Genkit {
  const currentKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!_ai || _aiKeySnapshot !== currentKey) {
    if (!currentKey) {
      const msg = 'GOOGLE_GENAI_API_KEY environment variable is missing. AI features disabled in this environment.';
      console.error('[Genkit Init] ' + msg);
      throw new Error(msg);
    }
    if (!_telemetryEnabled) {
      enableFirebaseTelemetry();
      _telemetryEnabled = true;
    }
    _ai = genkit({ plugins: [googleAI({ apiKey: currentKey })] });
    _aiKeySnapshot = currentKey;
  }
  return _ai;
}

export { z };
