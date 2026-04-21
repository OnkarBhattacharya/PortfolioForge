/**
 * @fileOverview An AI flow for generating portfolio content suggestions.
 *
 * - generatePortfolioContentSuggestions - Generates suggestions for headlines and summaries.
 * - PortfolioContentSuggestionsInput - The input type for the flow.
 * - PortfolioContentSuggestionsOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from '@/ai/genkit';

const PortfolioContentSuggestionsInputSchema = z.object({
  profession: z.string().optional().describe('The user\'s profession, e.g., "Software Engineer", "Graphic Designer".'),
  cvData: z.string().optional().describe('Data extracted from the uploaded CV.'),
  linkedInData: z.string().optional().describe('Data imported from LinkedIn profile.'),
  githubProjectsData: z.string().optional().describe('Data fetched from GitHub projects.'),
});

export type PortfolioContentSuggestionsInput = z.infer<
  typeof PortfolioContentSuggestionsInputSchema
>;

const PortfolioContentSuggestionsOutputSchema = z.object({
  suggestedDescription: z
    .string()
    .describe('AI-powered suggestion for the portfolio description.'),
  suggestedSummary: z
    .string()
    .describe('AI-powered suggestion for the portfolio summary.'),
});

export type PortfolioContentSuggestionsOutput = z.infer<
  typeof PortfolioContentSuggestionsOutputSchema
>;

export async function generatePortfolioContentSuggestions(
  input: PortfolioContentSuggestionsInput
): Promise<PortfolioContentSuggestionsOutput> {
  return portfolioContentSuggestionsFlow(input);
}

const portfolioContentSuggestionsFlow = ai.defineFlow(
  {
    name: 'portfolioContentSuggestionsFlow',
    inputSchema: PortfolioContentSuggestionsInputSchema,
    outputSchema: PortfolioContentSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are an expert career coach and copywriter who helps professionals create compelling portfolio content.

Based on the user's profession and the provided data from their CV, LinkedIn, and projects, generate engaging suggestions for their portfolio description and summary.

Profession: ${input.profession ?? 'Not specified'}
CV Data: ${input.cvData ?? 'Not provided'}
LinkedIn Data: ${input.linkedInData ?? 'Not provided'}
GitHub Projects Data: ${input.githubProjectsData ?? 'Not provided'}

Your tone should be professional but also creative and engaging. Highlight the candidate's unique skills tailored to their field.`,
      output: { schema: PortfolioContentSuggestionsOutputSchema },
      config: { temperature: 0.7 },
    });
    if (!output) {
      throw new Error('Failed to generate content suggestions. The model did not return valid data.');
    }
    return output;
  }
);
