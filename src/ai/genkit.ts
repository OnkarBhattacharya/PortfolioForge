
/**
 * @fileOverview Centralized Genkit AI configuration and initialization.
 *
 * This file configures a single `ai` instance for the entire application,
 * ensuring that all necessary plugins are registered before any flows are defined.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import { z } from 'zod';

// Enable Firebase telemetry for observability.
enableFirebaseTelemetry();

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});

export { z };
