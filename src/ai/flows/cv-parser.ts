
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {CvDataSchema} from '@/lib/types';

const CvParserInputSchema = z.object({
  cvFile: z
    .string()
    .describe(
      'A data URI of a CV or resume, which can be an image or a PDF document.'
    ),
});

export type CvParserInput = z.infer<typeof CvParserInputSchema>;
export type CvParserOutput = z.infer<typeof CvDataSchema>;

export async function parseCv(input: CvParserInput): Promise<CvParserOutput> {
  return cvParserFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cvParserPrompt',
  input: {schema: CvParserInputSchema},
  output: {
    schema: CvDataSchema
  },
  prompt: `You are an expert document analyst. Your task is to parse the following CV/Resume and extract structured data based on the provided schema. The document can be an image or a PDF.

    Key tasks:
    1.  **Identify the Profession**: Based on job titles and work experience, determine the candidate's profession (e.g., 'Software Engineer', 'Graphic Designer', 'Marketing Manager').
    2.  **Extract Standard Fields**: Accurately extract personal information, summary, work experience, and education.
    3.  **List Relevant Skills**: Identify and list the top 10-15 most relevant skills. These can be technical skills (like programming languages), software (like Adobe Photoshop), or methodologies (like Agile).

    CV Document: {{media url=cvFile}}
    
    Your output MUST be a valid JSON object that conforms to the output schema. Do not include any other text, comments, or code block fences in your response.`,
  config: {
    model: 'googleai/gemini-1.5-pro',
  },
});

export const cvParserFlow = ai.defineFlow(
  {
    name: 'cvParserFlow',
    inputSchema: CvParserInputSchema,
    outputSchema: CvDataSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to parse CV. The model did not return valid data.');
    }
    return output;
  }
);
