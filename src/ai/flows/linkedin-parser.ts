
'use server';

/**
 * @fileOverview An AI flow for parsing raw text from a LinkedIn profile into structured CvData.
 *
 * - parseLinkedInProfile - A function that handles the LinkedIn profile parsing process.
 * - LinkedInParserInput - The input type for the parseLinkedInProfile function.
 * - LinkedInParserOutput - The return type for the parseLinkedInProfile function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { CvDataSchema } from '@/lib/types';

const LinkedInParserInputSchema = z.object({
  profileText: z.string().describe('The raw text content copied from a user\'s LinkedIn profile PDF or page.'),
});

export type LinkedInParserInput = z.infer<typeof LinkedInParserInputSchema>;
export type LinkedInParserOutput = z.infer<typeof CvDataSchema>;

export async function parseLinkedInProfile(
  input: LinkedInParserInput
): Promise<LinkedInParserOutput> {
  return linkedInParserFlow(input);
}

const prompt = ai.definePrompt({
  name: 'linkedInParserPrompt',
  input: { schema: LinkedInParserInputSchema },
  output: { schema: CvDataSchema },
  prompt: `You are an expert data analyst specializing in professional profiles. Your task is to parse the raw text from a LinkedIn profile and extract structured data according to the provided schema.

    Key tasks:
    1.  **Identify the Profession**: Based on the headline and summary, determine the candidate's profession. If not clear, use the job title from their most recent work experience.
    2.  **Extract Standard Fields**: Accurately parse personal information, summary, work experience, education, and skills. Pay close attention to section headers to correctly categorize the information.
    3.  **Handle Missing Data**: If a field is not present in the profile text, omit it from the JSON output instead of including a null or empty value.

    LinkedIn Profile Text:
    {{profileText}}

    Your output MUST be a valid JSON object that conforms to the output schema. Do not include any other text, comments, or code block fences in your response.`,
});

const linkedInParserFlow = ai.defineFlow(
  {
    name: 'linkedInParserFlow',
    inputSchema: LinkedInParserInputSchema,
    outputSchema: CvDataSchema,
  },
  async ({ profileText }) => {
    const { output } = await prompt({ profileText });
    if (!output) {
      throw new Error('Failed to parse LinkedIn profile. The model did not return valid data.');
    }
    
    // The AI might miss the profession, so we'll infer it from the most recent job title as a fallback.
    if (!output.profession && output.experience && output.experience.length > 0) {
        output.profession = output.experience[0].jobTitle;
    }
    
    return output;
  }
);
