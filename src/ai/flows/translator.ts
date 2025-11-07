'use server';

/**
 * @fileOverview An AI flow for translating text into different languages.
 *
 * - translate - A function that handles the text translation process.
 * - TranslationInput - The input type for the translate function.
 * - TranslationOutput - The return type for the translate function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslationInputSchema = z.object({
  texts: z.array(z.string()).describe('An array of text strings to translate.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "Spanish", "French", "German").'),
});

const TranslationOutputSchema = z.object({
    translations: z.array(z.string()).describe('The array of translated texts, in the same order as the input.'),
});

export type TranslationInput = z.infer<typeof TranslationInputSchema>;
export type TranslationOutput = z.infer<typeof TranslationOutputSchema>;

export async function translate(
  input: TranslationInput
): Promise<TranslationOutput> {
  return translationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'textTranslatorPrompt',
  input: { schema: TranslationInputSchema },
  output: { schema: TranslationOutputSchema },
  prompt: `You are a professional translator. Your task is to translate an array of text strings into a specified target language.\n\n    **Target Language:** {{targetLanguage}}\n\n    **Input Texts (JSON array of strings):**\n    {{JSON.stringify texts}}\n\n    **Instructions:**\n    1.  Translate each text string from the input array into the target language.\n    2.  Maintain the original order of the texts in your output.\n    3.  Your response MUST be a valid JSON object that conforms to the following output schema:\n        { "translations": ["string", ...] }\n    4.  Do not include any other text, comments, or code block fences in your response.\n\n    **Example:**\n    If the input is \`{"texts": ["Hello", "How are you?"], "targetLanguage": "Spanish"}\`,\n    the output should be \`{"translations": ["Hola", "¿Cómo estás?"]}\`.\n  `,
  config: {
      temperature: 0.1, // Lower temperature for more precise, deterministic translations
  }
});

const translationFlow = ai.defineFlow(
  {
    name: 'translationFlow',
    inputSchema: TranslationInputSchema,
    outputSchema: TranslationOutputSchema,
  },
  async (input) => {
    if (input.texts.length === 0) {
        return { translations: [] };
    }

    const { output } = await prompt(input);
    
    if (!output || !Array.isArray(output.translations) || output.translations.length !== input.texts.length) {
      throw new Error('Translation failed. The model returned invalid or incomplete data.');
    }

    return output;
  }
);
