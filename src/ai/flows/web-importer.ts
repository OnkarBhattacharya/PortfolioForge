/**
 * @fileOverview A Genkit flow for importing content from a URL into a portfolio item.
 *
 * - importFromUrl - A function that fetches content from a URL and uses AI to summarize it.
 * - WebImporterInput - The input type for the importFromUrl function.
 * - WebImporterOutput - The return type for the importFromUrl function.
 */

import { getAi, z } from '@/ai/genkit';
import { parse } from 'node-html-parser';

const WebImporterInputSchema = z.object({
  url: z.string().url().describe('The URL of the page to import.'),
});

const WebImporterOutputSchema = z.object({
  name: z.string().describe('The concise, engaging title of the content, extracted from the page.'),
  description: z.string().describe('A 2-3 sentence summary of the page content, written in a professional tone for a portfolio.'),
  tags: z.array(z.string()).describe('A list of 3-5 relevant keywords or technologies found on the page.'),
});

export type WebImporterInput = z.infer<typeof WebImporterInputSchema>;
export type WebImporterOutput = z.infer<typeof WebImporterOutputSchema>;

const PROMPT_TEXT = `You are an expert content analyst and copywriter. Your task is to analyze the text content of a webpage and extract structured data suitable for a professional portfolio.

    Analyze the content and perform the following actions:
    1.  **Generate a Title**: Create a concise, engaging title for the content. This should be based on the main heading or purpose of the page.
    2.  **Write a Summary**: Craft a professional, 2-3 sentence summary of the page's main content. This summary should be perfect for a portfolio item description.
    3.  **Suggest Tags**: Identify 3-5 of the most relevant keywords, concepts, or technologies from the text to use as tags.

    Webpage Text Content:
    {{pageAsText}}

    Your output MUST be a valid JSON object that conforms to the output schema. Do not include any other text, comments, or code block fences in your response.`;

export async function importFromUrl(input: WebImporterInput): Promise<WebImporterOutput> {
  let rawHtml = '';
  try {
    const response = await fetch(input.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
    });
    if (!response.ok) throw new Error(`Failed to fetch URL with status: ${response.status}`);
    rawHtml = await response.text();
  } catch (error) {
    throw new Error('The URL could not be reached. Please check if it\'s a valid, publicly accessible page.');
  }

  if (!rawHtml.trim()) throw new Error('The fetched content from the URL is empty.');

  const root = parse(rawHtml);
  root.querySelectorAll('script, style, nav, footer, header, aside').forEach(node => node.remove());
  const pageAsText = root.textContent || '';
  const truncatedText = pageAsText.length > 30000 ? pageAsText.substring(0, 30000) : pageAsText;

  if (!truncatedText.trim()) {
    throw new Error('Could not extract meaningful text content from the URL. The page might be rendered dynamically with JavaScript.');
  }

  const ai = getAi();
  const prompt = ai.definePrompt({
    name: 'webContentSummarizerPrompt',
    input: { schema: z.object({ pageAsText: z.string() }) },
    output: { schema: WebImporterOutputSchema },
    prompt: PROMPT_TEXT,
  });

  const { output } = await prompt({ pageAsText: truncatedText });
  if (!output) {
    throw new Error('The AI model could not process the content from the URL. Please try a different page.');
  }
  return output;
}
