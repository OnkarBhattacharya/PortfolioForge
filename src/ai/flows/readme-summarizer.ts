/**
 * @fileOverview An AI flow for summarizing the content of a GitHub README file.
 *
 * - summarizeReadme - A function that takes README content and returns a summary.
 * - ReadmeSummarizerInput - The input type for the summarizeReadme function.
 * - ReadmeSummarizerOutput - The return type for the summarizeReadme function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  prompt: `You are an expert technical writer. Your task is to read the following README.md file content and generate a concise, compelling 1-2 sentence summary for a developer portfolio.

    The summary should:
    -   Clearly state the project's purpose (the "why").
    -   Mention the key technologies or features (the "what" and "how").
    -   Be engaging and easy for both technical and non-technical audiences to understand.

    README Content:
    {{readmeContent}}

    Your output MUST be a single string containing only the summary. Do not include any other text, comments, or code block fences.`,
    config: {
        temperature: 0.4, // Slightly lower for more factual summaries
    }
});

const readmeSummarizerFlow = ai.defineFlow(
  {
    name: 'readmeSummarizerFlow',
    inputSchema: ReadmeSummarizerInputSchema,
    outputSchema: ReadmeSummarizerOutputSchema,
  },
  async ({ readmeContent }) => {
    // Truncate content to avoid excessive token usage, focusing on the most important part of the README.
    const truncatedContent = readmeContent.length > 15000 ? readmeContent.substring(0, 15000) : readmeContent;

    const { output } = await prompt({ readmeContent: truncatedContent });
    
    if (!output) {
      throw new Error('Failed to summarize README. The model did not return a valid summary.');
    }
    
    return output;
  }
);
