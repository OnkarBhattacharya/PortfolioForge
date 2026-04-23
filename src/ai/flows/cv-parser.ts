/**
 * @fileOverview A multi-modal AI flow for parsing a user's CV (PDF or image).
 *
 * - parseCv - A function that handles the CV parsing process.
 * - CvParserInput - The input type for the parseCv function.
 * - CvParserOutput - The return type for the parseCv function.
 */

import { getAi, z } from '@/ai/genkit';
import { CvDataSchema } from '@/lib/types';

const CvParserInputSchema = z.object({
  cvFile: z.string().describe('A data URI of a CV or resume, which can be an image or a PDF document.'),
});

export type CvParserInput = z.infer<typeof CvParserInputSchema>;
export type CvParserOutput = z.infer<typeof CvDataSchema>;

const PROMPT_TEXT = `You are an expert document analyst. Your task is to parse the following CV/Resume and and extract structured data based on the provided schema. The document can be an image or a PDF.

    Key tasks:
    1.  **Identify the Profession**: Based on job titles and work experience, determine the candidate's profession (e.g., 'Software Engineer', 'Graphic Designer', 'Marketing Manager').
    2.  **Extract Standard Fields**: Accurately extract personal information, summary, work experience, and education.
    3.  **List Relevant Skills**: Identify and list the top 10-15 most relevant skills. These can be technical skills (like programming languages), software (like Adobe Photoshop), or methodologies (like Agile).

    CV Document: {{media url=cvFile}}
    
    Your output MUST be a valid JSON object that conforms to the output schema. Do not include any other text, comments, or code block fences in your response.`;

export async function parseCv(input: CvParserInput): Promise<CvParserOutput> {
  // Input validation for CV data URI
  const sizeKb = Math.round((input.cvFile.length * 3) / 4 / 1024); // Base64 overhead ~33%
  if (sizeKb > 10000) { // 10MB limit for multimodal
    throw new Error('CV file too large (10MB+). Compress or split.');
  }
  if (!input.cvFile.startsWith('data:(application/pdf|image/') && !input.cvFile.includes(';base64,')) {
    throw new Error('Invalid CV format. Use PDF or image (PNG/JPG).');
  }
  
  const ai = getAi();
  try {
    const cvParserPrompt = ai.definePrompt({
      name: 'cvParserPrompt',
      input: { schema: CvParserInputSchema },
      output: { schema: CvDataSchema },
      prompt: PROMPT_TEXT,
    });
    const { output } = await cvParserPrompt(input);
    if (!output) throw new Error('Model returned no output');
    CvDataSchema.parse(output);
    return output;
  } catch (generateError: any) {
    throw new Error(`CV parsing failed: ${generateError.message}. Ensure CV is clear PDF/image under 10MB.`);
  }
}

