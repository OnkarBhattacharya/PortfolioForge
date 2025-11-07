'use server';

/**
 * @fileOverview AI-powered content suggestions for portfolio descriptions and summaries.
 *
 * - generatePortfolioContentSuggestions - A function that generates portfolio content suggestions.
 * - PortfolioContentSuggestionsInput - The input type for the generatePortfolioContentSuggestions function.
 * - PortfolioContentSuggestionsOutput - The return type for the generatePortfolioContentSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const prompt = ai.definePrompt({
  name: 'portfolioContentSuggestionsPrompt',
  input: {schema: PortfolioContentSuggestionsInputSchema},
  output: {schema: PortfolioContentSuggestionsOutputSchema},
  prompt: `You are an expert career coach and copywriter who helps professionals create compelling portfolio content.

  Based on the user's profession and the provided data from their CV, LinkedIn, and projects, generate engaging suggestions for their portfolio description and summary.

  The user's profession is: {{profession}}

  CV Data: {{cvData}}
  LinkedIn Data: {{linkedInData}}
  GitHub Projects Data: {{githubProjectsData}}

  Your tone should be professional but also creative and engaging. The suggestions should highlight the candidate's unique skills and experience in a way that is tailored to their specific field.
  Your output should be a JSON object that conforms to PortfolioContentSuggestionsOutputSchema.
`,
});

const portfolioContentSuggestionsFlow = ai.defineFlow(
  {
    name: 'portfolioContentSuggestionsFlow',
    inputSchema: PortfolioContentSuggestionsInputSchema,
    outputSchema: PortfolioContentSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate content suggestions. The model did not return valid data.');
    }
    return output;
  }
);
