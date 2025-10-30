
'use server';

/**
 * @fileOverview A CV parsing AI agent.
 *
 * - cvParserFlow - A function that handles the CV parsing process.
 * - CvDataSchema - The Zod schema for the output data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CvDataSchema = z.object({
  personalInfo: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }).optional(),
  summary: z.string().optional(),
  experience: z.array(z.object({
    jobTitle: z.string().optional(),
    company: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    responsibilities: z.array(z.string()).optional(),
  })).optional(),
  education: z.array(z.object({
    degree: z.string().optional(),
    institution: z.string().optional(),
    location: z.string().optional(),
    graduationDate: z.string().optional(),
  })).optional(),
  skills: z.array(z.string()).optional(),
});

export type CvData = z.infer<typeof CvDataSchema>;

const prompt = ai.definePrompt({
  name: 'cvParserPrompt',
  input: { schema: z.string() },
  output: { schema: CvDataSchema },
  prompt: `
    You are an expert CV parser. Your task is to analyze the provided CV text and extract the information into a structured JSON format.
    The CV is provided below. Identify and extract the following sections:
    - Personal Information (name, email, phone, location, linkedin, github)
    - Summary
    - Work Experience (job title, company, location, dates, responsibilities)
    - Education (degree, institution, location, graduation date)
    - Skills

    Please format the output as a JSON object that strictly adheres to the provided schema.

    CV Text:
    ---
    {{{prompt}}}
    ---
  `,
  config: {
    temperature: 0.1,
  },
});

export const cvParserFlow = ai.defineFlow(
  {
    name: 'cvParserFlow',
    inputSchema: z.string(),
    outputSchema: CvDataSchema,
  },
  async (cvText) => {
    const { output } = await prompt(cvText);
    return output!;
  }
);
