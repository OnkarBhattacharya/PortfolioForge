
'use server';

/**
 * @fileOverview A CV parsing AI agent that uses multi-modal capabilities
 * to understand the document layout and intelligently extract and enrich user data.
 *
 * - cvParserFlow - A function that handles the CV parsing process.
 * - CvDataSchema - The Zod schema for the output data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const CvParserInputSchema = z.object({
  cvImage: z
    .string()
    .describe(
      "An image of the CV, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});

const CvDataSchema = z.object({
  personalInfo: z
    .object({
      name: z.string().describe("The candidate's full name."),
      email: z
        .string()
        .describe("The candidate's email address.")
        .optional(),
      phone: z
        .string()
        .describe("The candidate's phone number.")
        .optional(),
      location: z
        .string()
        .describe("The candidate's city and state, e.g., 'San Francisco, CA'.")
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
  summary: z
    .string()
    .describe(
      "A 2-3 sentence professional summary from the top of the candidate's CV."
    ),
  experience: z
    .array(
      z.object({
        jobTitle: z.string().describe('The job title or role.'),
        company: z.string().describe('The name of the company.'),
        location: z
          .string()
          .describe("The location of the company (e.g., 'Remote', 'New York, NY').")
          .optional(),
        startDate: z
          .string()
          .describe("The start date of the employment, e.g., 'May 2020'."),
        endDate: z
          .string()
          .describe(
            "The end date of the employment, e.g., 'Present' or 'Aug 2022'."
          ),
        responsibilities: z
          .array(z.string())
          .describe(
            'A list of 3-5 key responsibilities or accomplishments for this role.'
          ),
      })
    )
    .describe('A list of the candidate\'s professional work experiences.'),
  education: z
    .array(
      z.object({
        degree: z
          .string()
          .describe(
            "The degree obtained, e.g., 'B.S. in Computer Science'."
          ),
        institution: z
          .string()
          .describe('The name of the university or institution.'),
        location: z
          .string()
          .describe("The location of the institution (e.g., 'Berkeley, CA').")
          .optional(),
        graduationDate: z
          .string()
          .describe("The date of graduation, e.g., 'June 2018'."),
      })
    )
    .describe('A list of the candidate\'s educational qualifications.'),
  skills: z
    .array(z.string())
    .describe(
      'A list of skills explicitly mentioned in the "Skills" section of the CV.'
    )
    .optional(),
  inferredSkills: z
    .array(z.string())
    .describe(
      'A list of key technologies and programming languages inferred from the job descriptions in the work experience section.'
    )
    .optional(),
});

export type CvData = z.infer<typeof CvDataSchema>;

const prompt = ai.definePrompt({
  name: 'cvParserPrompt',
  input: {schema: CvParserInputSchema},
  output: {schema: CvDataSchema},
  prompt: `
    You are an expert CV parsing agent. Your task is to analyze the provided CV image and extract the information into a structured JSON format that strictly adheres to the provided schema.

    CV Image Analysis:
    - Pay close attention to the layout and structure of the document to correctly identify sections.
    - Extract Personal Information, Summary, Work Experience, Education, and any explicitly listed Skills.
    - Data Enrichment: From the 'Work Experience' section, infer the key technologies and programming languages the candidate has used (e.g., 'React', 'Next.js', 'Python', 'Go', 'Terraform', 'Google Cloud') and populate them into the 'inferredSkills' array.

    CV Image:
    {{media url=cvImage}}
  `,
  config: {
    temperature: 0.1,
  },
});

export const cvParserFlow = ai.defineFlow(
  {
    name: 'cvParserFlow',
    inputSchema: CvParserInputSchema,
    outputSchema: CvDataSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
