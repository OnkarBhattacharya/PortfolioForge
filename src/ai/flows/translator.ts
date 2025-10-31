
'use server';

/**
 * @fileOverview An AI flow for translating text into different languages.
 *
 * - translateText - A function that handles the text translation process.
 * - TranslationInput - The input type for the translateText function.
 * - TranslationOutput - The return type for the translateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TranslationInputSchema = z.object({
  texts: z.array(z.string()).describe('An array of text strings to translate.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "Spanish", "French").'),
});

const TranslationOutputSchema = z.object({
    translations: z.array(z.string()).describe('The array of translated texts, in the same order as the input.'),
});

export type TranslationInput = z.infer<typeof TranslationInputSchema>;
export type TranslationOutput = z.infer<typeof TranslationOutputSchema>;

export async function translateTexts(
  input: TranslationInput
): Promise<TranslationOutput> {
  return translationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'textTranslatorPrompt',
  input: { schema: TranslationInputSchema },
  output: { schema: TranslationOutputSchema },
  prompt: `You are a translation expert. Translate the following array of texts into {{targetLanguage}}.

Respond ONLY with a valid JSON object that conforms to the specified output schema. The 'translations' array must have the exact same number of elements as the input array, and they must be in the same order.

Input Texts:
{{#each texts}}
- "{{this}}"
{{/each}}
`,
  config: {
      temperature: 0.2, // Lower temperature for more deterministic translations
  }
});

const translationFlow = ai.defineFlow(
  {
    name: 'translationFlow',
    inputSchema: TranslationInputSchema,
    outputSchema: TranslationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Translation failed. The model did not return valid data.');
    }
    return output;
  }
);
