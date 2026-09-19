import { z } from 'zod';

export const CvDataSchema = z.object({
  personalInfo: z.object({
    name: z.string().describe("The candidate's full name."),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
  }).describe("The personal contact information of the candidate."),
  profession: z.string().describe("The candidate's profession, e.g., 'Software Engineer', 'Graphic Designer', 'Marketing Manager'."),
  summary: z.string().describe("A 2-3 sentence professional summary from the top of the candidate's CV."),
  experience: z.array(z.object({
    jobTitle: z.string().describe('The job title, e.g., "Software Engineer".'),
    company: z.string().describe('The name of the company.'),
    location: z.string().optional(),
    startDate: z.string().describe('The start date of employment, e.g., "October 2020".'),
    endDate: z.string().describe('The end date of employment, e.g., "Present" or "January 2022".'),
    responsibilities: z.array(z.string()).describe('A list of 2-4 key responsibilities or accomplishments.'),
  })).describe("A list of the candidate's work experiences."),
  education: z.array(z.object({
    degree: z.string().describe('The degree obtained, e.g., "Bachelor of Science in Computer Science".'),
    institution: z.string().describe('The name of the university or school.'),
    location: z.string().optional(),
    graduationDate: z.string().describe('The graduation date, e.g., "May 2020".'),
  })).describe("A list of the candidate's educational qualifications."),
  skills: z.array(z.string()).describe('A list of 10-15 of the most important technical skills, software, or methodologies mentioned in the CV.'),
});

export type CvData = z.infer<typeof CvDataSchema>;

export const GithubRepositorySchema = z.object({
  name: z.string().describe('The name of the repository.'),
  description: z.string().nullable().describe("The AI-generated summary of the repository's README or the original description."),
  url: z.string().url().describe('The URL of the repository.'),
  language: z.string().nullable().describe('The primary programming language of the repository.'),
});

export type GithubRepository = z.infer<typeof GithubRepositorySchema>;

export const PortfolioItemSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  content_md: z.string().optional(),
  tags: z.array(z.string()).default([]),
  image_url: z.string().url().optional().nullable(),
  project_url: z.string().url().optional().nullable(),
  repo_url: z.string().url().optional().nullable(),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;

export const CreateItemInputSchema = PortfolioItemSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
});

export type CreateItemInput = z.infer<typeof CreateItemInputSchema>;

export const UpdateItemInputSchema = CreateItemInputSchema.partial();

export type UpdateItemInput = z.infer<typeof UpdateItemInputSchema>;

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/),
  full_name: z.string().max(100).optional(),
  headline: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  avatar_url: z.string().url().optional().nullable(),
  links: z.object({
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional(),
  }).default({}),
  skills: z.array(z.string()).default([]),
  theme_id: z.string().default('minimal'),
  custom_theme: z.record(z.string()).optional(),
  subscription_tier: z.enum(['free', 'pro', 'studio']).default('free'),
  subscription_status: z.enum(['active', 'inactive', 'past_due', 'canceled']).default('inactive'),
  stripe_customer_id: z.string().optional(),
  stripe_subscription_id: z.string().optional(),
  role: z.enum(['user', 'admin']).default('user'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Profile = z.infer<typeof ProfileSchema>;

export const UpdateProfileInputSchema = ProfileSchema.omit({
  id: true,
  username: true,
  created_at: true,
  updated_at: true,
  subscription_tier: true,
  subscription_status: true,
  stripe_customer_id: true,
  stripe_subscription_id: true,
  role: true,
}).partial();

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

export const ThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  css_vars: z.record(z.string()),
  preview_image_url: z.string().url().optional().nullable(),
  is_premium: z.boolean().default(false),
});

export type Theme = z.infer<typeof ThemeSchema>;

export const ThemeConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  light: z.object({
    background: z.string(),
    foreground: z.string(),
    primary: z.string(),
    primary_foreground: z.string(),
    secondary: z.string(),
    secondary_foreground: z.string(),
    muted: z.string(),
    muted_foreground: z.string(),
    accent: z.string(),
    accent_foreground: z.string(),
    destructive: z.string(),
    destructive_foreground: z.string(),
    border: z.string(),
    input: z.string(),
    ring: z.string(),
  }),
  dark: z.object({
    background: z.string(),
    foreground: z.string(),
    primary: z.string(),
    primary_foreground: z.string(),
    secondary: z.string(),
    secondary_foreground: z.string(),
    muted: z.string(),
    muted_foreground: z.string(),
    accent: z.string(),
    accent_foreground: z.string(),
    destructive: z.string(),
    destructive_foreground: z.string(),
    border: z.string(),
    input: z.string(),
    ring: z.string(),
  }),
  font: z.object({
    heading: z.object({
      family: z.string(),
      variants: z.array(z.string()),
      url: z.string().url(),
    }),
    body: z.object({
      family: z.string(),
      variants: z.array(z.string()),
      url: z.string().url(),
    }),
  }),
  border_radius: z.number().min(0).max(1),
});

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

export const AIContentSuggestionsSchema = z.object({
  suggestedDescription: z.string(),
  suggestedSummary: z.string(),
});

export type AIContentSuggestions = z.infer<typeof AIContentSuggestionsSchema>;

export const ThemeGenerateInputSchema = z.object({
  prompt: z.string().min(10).max(1000),
});

export type ThemeGenerateInput = z.infer<typeof ThemeGenerateInputSchema>;

export const ContentSuggestInputSchema = z.object({
  profession: z.string().optional(),
  cvData: z.string().optional(),
  linkedInData: z.string().optional(),
  githubProjectsData: z.string().optional(),
});

export type ContentSuggestInput = z.infer<typeof ContentSuggestInputSchema>;

export const TranslateInputSchema = z.object({
  texts: z.array(z.string()).min(1),
  targetLanguage: z.string(),
});

export type TranslateInput = z.infer<typeof TranslateInputSchema>;

export const TranslateOutputSchema = z.object({
  translations: z.array(z.string()),
});

export type TranslateOutput = z.infer<typeof TranslateOutputSchema>;

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ApiSuccessSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

export type ApiSuccess<T> = { success: true; data: T };

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export const CvParseInputSchema = z.object({
  cvFile: z.string().describe('A data URI of a CV or resume, which can be an image or a PDF document.'),
});

export type CvParseInput = z.infer<typeof CvParseInputSchema>;
export type CvParseOutput = z.infer<typeof CvDataSchema>;

export const LinkedInParseInputSchema = z.object({
  profileText: z.string().describe('The raw text content copied from a user\'s LinkedIn profile PDF or page.'),
});

export type LinkedInParseInput = z.infer<typeof LinkedInParseInputSchema>;
export type LinkedInParseOutput = z.infer<typeof CvDataSchema>;

export const GithubImporterInputSchema = z.object({
  username: z.string().describe('The GitHub username.'),
});

export type GithubImporterInput = z.infer<typeof GithubImporterInputSchema>;
export type GithubImporterOutput = z.infer<typeof z.array(GithubRepositorySchema)>;

export const WebImporterInputSchema = z.object({
  url: z.string().url().describe('The URL to import.'),
});

export type WebImporterInput = z.infer<typeof WebImporterInputSchema>;
export type WebImporterOutput = z.infer<typeof z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  content_md: z.string(),
})>;