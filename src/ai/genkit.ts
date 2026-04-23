
/**
 * @fileOverview Centralized Genkit AI configuration and initialization.
 *
 * This file configures a single `ai` instance for the entire application,
 * ensuring that all necessary plugins are registered before any flows are defined.
 */

import { genkit, type Genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import { z } from 'zod';

let _ai: Genkit | undefined;

function getInstance(): Genkit {
  if (!_ai) {
    enableFirebaseTelemetry();
    _ai = genkit({ plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })] });
  }
  return _ai;
}

export const ai = new Proxy({} as Genkit, {
  get(_target, prop) {
    return (getInstance() as never)[prop];
  },
});

export { z };
