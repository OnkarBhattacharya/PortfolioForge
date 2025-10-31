
'use server';

/**
 * @fileOverview An AI flow for summarizing the content of a GitHub README file.
 *
 * - summarizeReadme - A function that takes README content and returns a summary.
 * - ReadmeSummarizerInput - The input type for the summarizeReadme function.
 * - ReadmeSummarizerOutput - The return type for the summarizeReadme function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ReadmeSummarizerInputSchema = z.object({
  readmeContent: z.string().describe('The full text content of a README.md file.'),
});

const ReadmeSummarizerOutputSchema = z.string().describe('A concise, 1-2 sentence summary of the project, suitable for a portfolio.');

export type ReadmeSummarizerInput = z.infer<typeof ReadmeSummarizerInputSchema>;
export type ReadmeSummarizerOutput = z.infer<typeof ReadmeSummarizerOutputSchema>;

export async function summarizeReadme(
  input: ReadmeSummarizerInput
): Promise<ReadmeSummarizerOutput> {
  return readmeSummarizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'readmeSummarizerPrompt',
  input: { schema: ReadmeSummarizerInputSchema },
  output: { schema: ReadmeSummarizerOutputSchema },
  prompt: `You are an expert technical writer. Your task is to read the following README.md file content and generate a concise, 1-2 sentence summary that would be appropriate for a software developer's portfolio. Focus on the project's purpose and key features.

README Content:
{{{readmeContent}}}`,
  config: {
      temperature: 0.3,
  }
});

const readmeSummarizerFlow = ai.defineFlow(
  {
    name: 'readmeSummarizerFlow',
    inputSchema: ReadmeSummarizerInputSchema,
    outputSchema: ReadmeSummarizerOutputSchema,
  },
  async ({ readmeContent }) => {
    // Limit content size to avoid excessive token usage
    const truncatedContent = readmeContent.length > 20000 ? readmeContent.substring(0, 20000) : readmeContent;

    const { output } = await prompt({ readmeContent: truncatedContent });
    if (!output) {
      throw new Error('Failed to summarize README. The model did not return a valid summary.');
    }
    return output;
  }
);
