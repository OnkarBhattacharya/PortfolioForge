
'use server';

/**
 * @fileOverview Centralized Genkit AI configuration and initialization.
 *
 * This file configures a single `ai` instance for the entire application,
 * ensuring that all necessary plugins are registered before any flows are defined.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { firebase } from '@genkit-ai/firebase';
import { z } from 'zod';

// Statically configure the `ai` instance with all required plugins.
// This ensures that the plugins are registered once when the module is loaded.
export const ai = genkit({
  plugins: [
    firebase(),
    googleAI({
      // You can specify the API version if needed, e.g., 'v1beta'
      // apiVersion: 'v1beta',
    }),
  ],
  // Log 'warn' and 'error' messages in production. Use 'debug' for development.
  logLevel: 'warn',
  // Enable native JS structured cloning for performance.
  enableCloning: true,
});

// Re-export Zod for consistent usage in flows.
export { z };
