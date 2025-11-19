
'use server';
/**
 * @fileOverview An AI flow for improving user-written text content.
 *
 * - contentSuggesterFlow - A flow that provides suggestions to improve text.
 * - ContentSuggesterInputSchema - The input type for the flow.
 * - ContentSuggesterOutputSchema - The output type for the flow.
 */
import { ai, z } from '@/ai/genkit';

export const ContentSuggesterInputSchema = z.object({
  text: z.string().describe("The user's current text content."),
  contentType: z
    .string()
    .describe(
      'The type of content to improve (e.g., "project description", "summary").'
    ),
});

export const ContentSuggesterOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of AI-generated suggestions to improve the text.'),
});

export type ContentSuggesterInput = z.infer<typeof ContentSuggesterInputSchema>;
export type ContentSuggesterOutput = z.infer<
  typeof ContentSuggesterOutputSchema
>;

export const contentSuggesterFlow = ai.defineFlow(
  {
    name: 'contentSuggesterFlow',
    inputSchema: ContentSuggesterInputSchema,
    outputSchema: ContentSuggesterOutputSchema,
  },
  async ({ text, contentType }) => {
    if (!text.trim()) {
      return { suggestions: [] };
    }
    
    const { output } = await ai.generate({
      prompt: `You are an expert copywriter and editor. Your task is to provide a list of suggestions to improve the user's text. The suggestions should be constructive, and a few of them should be complete rewrites in different tones (e.g. more professional, more casual, more impactful). Do not return your own preamble, just the suggestions.

Content Type: "${contentType}"

User's Text: "${text}"`,
      output: {
        schema: ContentSuggesterOutputSchema,
      },
      config: {
        temperature: 0.7,
      },
    });

    if (!output) {
      throw new Error(
        'Failed to generate suggestions. The model did not return a valid response.'
      );
    }

    return output;
  }
);
