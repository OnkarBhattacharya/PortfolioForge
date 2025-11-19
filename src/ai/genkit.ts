
'use server';

/**
 * @fileOverview Centralized Genkit AI configuration and initialization.
 *
 * This file configures a single `ai` instance for the entire application,
 * ensuring that all necessary plugins are registered before any flows are defined.
 * It replaces the previous dynamic `getAiInstance` model with a static,
 * more robust configuration.
 */

import { genkit, readableFromAuthor, stringFromPart } from 'genkit';
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
  // Log all traces to the console for easier debugging in development.
  logLevel: 'debug',
  // Enable native JS structured cloning for performance.
  enableCloning: true,
});

/**
 * A simple helper to extract the text from a Genkit Part.
 *
 * @param {PartLike} part - The part to extract text from.
 * @returns {string} The extracted text.
 */
export function getText(part: any): string {
  if (part.text) {
    return part.text;
  }
  if (part.content) {
    return part.content.map(getText).join('');
  }
  return '';
}

// Re-export Zod for consistent usage in flows.
export { z };
