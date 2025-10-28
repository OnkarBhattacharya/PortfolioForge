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
  prompt: `You are an AI assistant that helps software engineers create compelling portfolio content.

  Based on the provided data from their CV, LinkedIn, and GitHub projects, generate suggestions for their portfolio description and summary.

  CV Data: {{{cvData}}}
  LinkedIn Data: {{{linkedInData}}}
  GitHub Projects Data: {{{githubProjectsData}}}

  Please provide creative and engaging content suggestions that highlight the candidate's skills and experience.
  Your output should be a JSON object that conforms to PortfolioContentSuggestionsOutputSchema. Make sure the description and summary
  are relevant and tailored to the provided data.
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
    return output!;
  }
);
