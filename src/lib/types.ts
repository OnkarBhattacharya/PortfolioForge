
import { z } from 'zod';

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

export type CvData = z.infer<typeof CvDataSchema>;
