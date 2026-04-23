/**
 * @fileOverview An AI flow for translating text into different languages.
 *
 * - translate - A function that handles the text translation process.
 * - TranslationInput - The input type for the translate function.
 * - TranslationOutput - The return type for the translate function.
 */

import { getAi, z } from '@/ai/genkit';

const TranslationInputSchema = z.object({
  texts: z.array(z.string()).describe('An array of text strings to translate.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "Spanish", "French", "German").'),
});

const TranslationOutputSchema = z.object({
  translations: z.array(z.string()).describe('The array of translated texts, in the same order as the input.'),
});

export type TranslationInput = z.infer<typeof TranslationInputSchema>;
export type TranslationOutput = z.infer<typeof TranslationOutputSchema>;

const PROMPT_TEXT = `You are a professional translator. Your task is to translate an array of text strings into a specified target language.

    **Target Language:** {{targetLanguage}}

    **Input Texts (JSON array of strings):**
    {{JSON.stringify texts}}

    **Instructions:**
    1.  Translate each text string from the input array into the target language.
    2.  Maintain the original order of the texts in your output.
    3.  Your response MUST be a valid JSON object that conforms to the following output schema:
        { "translations": ["string", ...] }
    4.  Do not include any other text, comments, or code block fences in your response.

    **Example:**
    If the input is \`{"texts": ["Hello", "How are you?"], "targetLanguage": "Spanish"}\`,
    the output should be \`{"translations": ["Hola", "¿Cómo estás?"]}\`.
  `;

export async function translate(input: TranslationInput): Promise<TranslationOutput> {
  if (input.texts.length === 0) return { translations: [] };

  const ai = getAi();
  const { output } = await ai.generate({
    prompt: `You are a professional translator. Translate each of the following texts into ${input.targetLanguage}. Return a JSON object with a "translations" array in the same order as the input.

Input texts: ${JSON.stringify(input.texts)}

Respond ONLY with valid JSON: { "translations": [...] }`,
    output: { schema: TranslationOutputSchema },
    config: { temperature: 0.1 },
  });
  if (!output || !Array.isArray(output.translations) || output.translations.length !== input.texts.length) {
    throw new Error('Translation failed. The model returned invalid or incomplete data.');
  }
  return output;
}
