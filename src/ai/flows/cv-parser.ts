
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const CvDataSchema = z.object({
  personalInfo: z
    .object({
      name: z.string().describe("The candidate's full name."),
      email: z.string().describe("The candidate's email address.").optional(),
      phone: z.string().describe("The candidate's phone number.").optional(),
      location: z
        .string()
        .describe("The candidate's city and state, e.g., 'San Francisco, CA.'")
        .optional(),
      linkedin: z
        .string()
        .describe("A full URL to the candidate's LinkedIn profile.")
        .optional(),
      github: z
        .string()
        .describe("A full URL to the candidate's GitHub profile.")
        .optional(),
    })
    .describe('The personal contact information of the candidate.'),
  profession: z.string().describe("The candidate's profession, e.g., 'Software Engineer', 'Graphic Designer', 'Marketing Manager'."),
  summary: z
    .string()
    .describe(
      "A 2-3 sentence professional summary from the top of the candidate's CV."
    ),
  experience: z
    .array(
      z.object({
        jobTitle: z.string().describe('The job title, e.g., "Software Engineer".'),
        company: z.string().describe('The name of the company.'),
        location: z
          .string()
          .describe('The location of the company, e.g., "San Francisco, CA".')
          .optional(),
        startDate: z
          .string()
          .describe('The start date of employment, e.g., "October 2020".'),
        endDate: z
          .string()
          .describe('The end date of employment, e.g., "Present" or "January 2022".'),
        responsibilities: z
          .array(z.string())
          .describe('A list of 2-4 key responsibilities or accomplishments.'),
      })
    )
    .describe("A list of the candidate's work experiences."),
  education: z
    .array(
      z.object({
        degree: z
          .string()
          .describe(
            'The degree obtained, e.g., "Bachelor of Science in Computer Science".'
          ),
        institution: z.string().describe('The name of the university or school.'),
        location: z
          .string()
          .describe('The location of the institution.')
          .optional(),
        graduationDate: z
          .string()
          .describe('The graduation date, e.g., "May 2020".'),
      })
    )
    .describe("A list of the candidate's educational qualifications."),
  skills: z
    .array(z.string())
    .describe(
      'A list of 10-15 of the most important technical skills, software, or methodologies mentioned in the CV.'
    ),
});

const CvParserInputSchema = z.string().describe('A data URI of a CV or resume, which can be an image or a PDF document.');
export type CvParserInput = z.infer<typeof CvParserInputSchema>;
export type CvParserOutput = z.infer<typeof CvDataSchema>;

export async function parseCv(input: CvParserInput): Promise<CvParserOutput> {
    return cvParserFlow(input);
}


const prompt = ai.definePrompt({
    name: 'cvParserPrompt',
    input: { schema: CvParserInputSchema },
    output: { schema: CvDataSchema },
    prompt: `You are an expert document analyst. Your task is to parse the following CV/Resume and extract structured data based on the provided schema. The document can be an image or a PDF.

    Key tasks:
    1.  **Identify the Profession**: Based on job titles and work experience, determine the candidate's profession (e.g., 'Software Engineer', 'Graphic Designer', 'Marketing Manager').
    2.  **Extract Standard Fields**: Accurately extract personal information, summary, work experience, and education.
    3.  **List Relevant Skills**: Identify and list the top 10-15 most relevant skills. These can be technical skills (like programming languages), software (like Adobe Photoshop), or methodologies (like Agile).

    CV Document: {{media url=prompt}}`,
    config: {
      model: 'googleai/gemini-1.5-pro',
    }
});


const cvParserFlow = ai.defineFlow(
  {
    name: 'cvParserFlow',
    inputSchema: CvParserInputSchema,
    outputSchema: CvDataSchema,
  },
  async (cvFile) => {
    const {output} = await prompt(cvFile);
    if (!output) {
      throw new Error('Failed to parse CV. The model did not return valid data.');
    }
    return output;
  }
);
