
'use server';

/**
 * @fileOverview A Genkit flow for importing content from a URL into a portfolio item.
 *
 * - importFromUrl - A function that fetches content from a URL and uses AI to summarize it.
 * - WebImporterInput - The input type for the importFromUrl function.
 * - WebImporterOutput - The return type for the importFromUrl function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WebImporterInputSchema = z.object({
  url: z.string().url().describe('The URL of the page to import.'),
});

const WebImporterOutputSchema = z.object({
    name: z.string().describe("The concise, engaging title of the content, extracted from the page."),
    description: z.string().describe("A 2-3 sentence summary of the page content, written in a professional tone for a portfolio."),
    tags: z.array(z.string()).describe("A list of 3-5 relevant keywords or technologies found on the page.")
});


export type WebImporterInput = z.infer<typeof WebImporterInputSchema>;
export type WebImporterOutput = z.infer<typeof WebImporterOutputSchema>;

export async function importFromUrl(
  input: WebImporterInput
): Promise<WebImporterOutput> {
  return webImporterFlow(input);
}


const prompt = ai.definePrompt({
    name: 'webContentSummarizerPrompt',
    input: { schema: z.object({ content: z.string() }) },
    output: { schema: WebImporterOutputSchema },
    prompt: `You are an expert content analyst. Your task is to analyze the provided raw HTML content of a webpage and extract structured data suitable for a professional portfolio.

    Analyze the content and perform the following actions:
    1.  **Extract the Title**: Find the most relevant title for the content. This might be from the <title> tag, an <h1> tag, or a meta property.
    2.  **Generate a Summary**: Write a concise, professional, 2-3 sentence summary of the page's main content. The summary should be engaging and suitable for a portfolio item description.
    3.  **Suggest Tags**: Identify 3-5 of the most relevant keywords, concepts, or technologies from the text to use as tags.

    HTML Content:
    {{{content}}}`,
});


const webImporterFlow = ai.defineFlow(
  {
    name: 'webImporterFlow',
    inputSchema: WebImporterInputSchema,
    outputSchema: WebImporterOutputSchema,
  },
  async ({ url }) => {
    
    let pageContent = '';
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!response.ok) {
            throw new Error(`Failed to fetch URL with status: ${response.status}`);
        }
        pageContent = await response.text();
    } catch (error) {
        console.error(`Could not fetch content from URL: ${url}`, error);
        throw new Error(`The URL could not be reached. Please check if it's a valid, publicly accessible page.`);
    }

    if (pageContent.length > 500000) { // Limit content size to avoid excessive processing
        pageContent = pageContent.substring(0, 500000);
    }

    const { output } = await prompt({ content: pageContent });
    if (!output) {
      throw new Error('The AI model could not process the content from the URL.');
    }

    return output;
  }
);

    