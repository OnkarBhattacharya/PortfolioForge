import OpenAI from 'openai';
import { z } from 'zod';
import { 
  CvDataSchema, 
  GithubRepositorySchema, 
  AIContentSuggestionsSchema, 
  ThemeConfigSchema,
  TranslateOutputSchema,
  type CvData,
  type GithubRepository,
  type AIContentSuggestions,
  type ThemeConfig,
  type TranslateOutput,
} from '@/types';

const FREE_MODELS = {
  VISION: 'meta-llama/llama-3.2-11b-vision-instruct:free',
  TEXT: 'meta-llama/llama-3.1-8b-instruct:free',
  LONG_CONTEXT: 'microsoft/phi-3-mini-128k-instruct:free',
  CREATIVE: 'google/gemma-2-9b-it:free',
} as const;

export type ModelKey = keyof typeof FREE_MODELS;

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL!,
    'X-Title': 'PortfolioForge',
  },
});

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimiter = new Map<string, RateLimitEntry>();

async function checkRateLimit(userId: string, feature: string): Promise<boolean> {
  const key = `${userId}:${feature}`;
  const now = Date.now();
  const limit = rateLimiter.get(key);

  if (!limit || now > limit.resetAt) {
    rateLimiter.set(key, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (limit.count >= 10) return false;
  limit.count++;
  return true;
}

async function callModel<T>({
  model,
  messages,
  responseSchema,
  maxTokens = 2000,
  temperature = 0.3,
}: {
  model: string;
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  responseSchema: z.ZodSchema<T>;
  maxTokens?: number;
  temperature?: number;
}): Promise<T> {
  const completion = await openrouter.chat.completions.create({
    model,
    messages,
    response_format: { type: 'json_object' },
    max_tokens: maxTokens,
    temperature,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Empty AI response');

  const parsed = JSON.parse(content);
  return responseSchema.parse(parsed);
}

const CV_PARSE_PROMPT = `You are an expert document analyst. Your task is to parse the following CV/Resume and extract structured data based on the provided schema. The document can be an image or a PDF.

Key tasks:
1.  **Identify the Profession**: Based on job titles and work experience, determine the candidate's profession (e.g., 'Software Engineer', 'Graphic Designer', 'Marketing Manager').
2.  **Extract Standard Fields**: Accurately extract personal information, summary, work experience, and education.
3.  **List Relevant Skills**: Identify and list the top 10-15 most relevant skills. These can be technical skills (like programming languages), software (like Adobe Photoshop), or methodologies (like Agile).

Your output MUST be a valid JSON object that conforms to the output schema. Do not include any other text, comments, or code block fences in your response.`;

const LINKEDIN_PARSE_PROMPT = `You are an expert data analyst specializing in professional profiles. Your task is to parse the raw text from a LinkedIn profile and extract structured data according to the provided schema.

Key tasks:
1.  **Identify the Profession**: Based on the headline and summary, determine the candidate's profession. If not clear, use the job title from their most recent work experience.
2.  **Extract Standard Fields**: Accurately parse personal information, summary, work experience, education, and skills. Pay close attention to section headers to correctly categorize the information.
3.  **Handle Missing Data**: If a field is not present in the profile text, omit it from the JSON output instead of including a null or empty value.

Your output MUST be a valid JSON object that conforms to the output schema. Do not include any other text, comments, or code block fences in your response.`;

const GITHUB_IMPORT_PROMPT = `You are an expert technical writer. Your task is to read the following GitHub repository data and generate a concise, compelling 1-2 sentence summary for a developer portfolio.

    The summary should:
    -   Clearly state the project's purpose (the "why").
    -   Mention the key technologies or features (the "what" and "how").
    -   Be engaging and easy for both technical and non-technical audiences to understand.

    Your output MUST be a valid JSON object that conforms to the output schema. Do not include any other text, comments, or code block fences in your response.`;

const WEB_IMPORT_PROMPT = `You are an expert web content analyzer. Given the HTML content of a webpage, extract portfolio-relevant information.

Extract:
- title: page title
- description: 2-3 sentence summary
- tags: relevant technologies/topics
- content_md: key content in markdown format

Output MUST be a valid JSON object matching schema. No extra text.`;

const CONTENT_SUGGEST_PROMPT = `You are an expert career coach and copywriter who helps professionals create compelling portfolio content.

Based on the user's profession and the provided data from their CV, LinkedIn, and projects, generate engaging suggestions for their portfolio description and summary.

Your tone should be professional but also creative and engaging. Highlight the candidate's unique skills tailored to their field.`;

const THEME_GEN_PROMPT = `You are an expert theme designer. Your task is to generate a unique and visually appealing theme configuration based on the user's prompt. The output must be a valid JSON object that conforms to the provided schema.

User Prompt: "{{prompt}}"`;

const README_SUMMARY_PROMPT = `You are an expert technical writer. Your task is to read the following README.md file content and generate a concise, compelling 1-2 sentence summary for a developer portfolio.

    The summary should:
    -   Clearly state the project's purpose (the "why").
    -   Mention the key technologies or features (the "what" and "how").
    -   Be engaging and easy for both technical and non-technical audiences to understand.

    Your output MUST be a single string containing only the summary. Do not include any other text, comments, or code block fences.`;

const TRANSLATE_PROMPT = (targetLanguage: string) => `You are a professional translator. Your task is to translate an array of text strings into a specified target language.

    **Target Language:** ${targetLanguage}

    **Input Texts (JSON array of strings):**
    {{JSON.stringify texts}}

    **Instructions:**
    1.  Translate each text string from the input array into the target language.
    2.  Maintain the original order of the texts in your output.
    3.  Your response MUST be a valid JSON object that conforms to the following output schema:
        { "translations": ["string", ...] }
    4.  Do not include any other text, comments, or code block fences in your response.

    **Example:**
    If the input is \`{"texts": ["Hello", "How are you?"], "targetLanguage": "Spanish"}\`,
    the output should be \`{"translations": ["Hola", "¿Cómo estás?"]}\`.`;

export class OpenRouterAI {
  private rateLimiter = new Map<string, { count: number; resetAt: number }>();

  private async checkRateLimit(userId: string, feature: string): Promise<boolean> {
    const key = `${userId}:${feature}`;
    const now = Date.now();
    const limit = this.rateLimiter.get(key);

    if (!limit || now > limit.resetAt) {
      this.rateLimiter.set(key, { count: 1, resetAt: now + 60000 });
      return true;
    }

    if (limit.count >= 10) return false;
    limit.count++;
    return true;
  }

  private async callModel<T>({
    model,
    messages,
    responseSchema,
    maxTokens = 2000,
    temperature = 0.3,
  }: {
    model: string;
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    responseSchema: z.ZodSchema<T>;
    maxTokens?: number;
    temperature?: number;
  }): Promise<T> {
    const completion = await openrouter.chat.completions.create({
      model,
      messages,
      response_format: { type: 'json_object' },
      max_tokens: maxTokens,
      temperature,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = JSON.parse(content);
    return responseSchema.parse(parsed);
  }

  private withFallback<T>(
    primary: () => Promise<T>,
    fallbacks: (() => Promise<T>)[]
  ): Promise<T> {
    return primary().catch((err) => {
      console.warn('Primary model failed, trying fallback:', err);
      if (fallbacks.length === 0) throw err;
      return this.withFallback(fallbacks[0], fallbacks.slice(1));
    });
  }

  async parseCV(userId: string, cvBase64: string, mimeType: string): Promise<CvData> {
    if (!(await this.checkRateLimit(userId, 'cv_parse'))) {
      throw new Error('Rate limit exceeded for CV parsing');
    }

    return this.withFallback(
      () => this.callModel({
        model: FREE_MODELS.VISION,
        messages: [
          { role: 'system', content: CV_PARSE_PROMPT },
          { role: 'user', content: [{ type: 'image_url', image_url: { url: `data:${mimeType};base64,${cvBase64}` } }] },
        ],
        responseSchema: CvDataSchema,
        maxTokens: 3000,
      }),
      [
        () => this.callModel({
          model: FREE_MODELS.CREATIVE,
          messages: [
            { role: 'system', content: CV_PARSE_PROMPT },
            { role: 'user', content: [{ type: 'image_url', image_url: { url: `data:${mimeType};base64,${cvBase64}` } }] },
          ],
          responseSchema: CvDataSchema,
          maxTokens: 3000,
        }),
      ]
    );
  }

  async parseLinkedIn(userId: string, profileText: string): Promise<CvData> {
    if (!(await this.checkRateLimit(userId, 'linkedin_parse'))) {
      throw new Error('Rate limit exceeded for LinkedIn parsing');
    }

    return this.withFallback(
      () => this.callModel({
        model: FREE_MODELS.TEXT,
        messages: [
          { role: 'system', content: LINKEDIN_PARSE_PROMPT },
          { role: 'user', content: profileText },
        ],
        responseSchema: CvDataSchema,
        maxTokens: 3000,
      }),
      [
        () => this.callModel({
          model: FREE_MODELS.LONG_CONTEXT,
          messages: [
            { role: 'system', content: LINKEDIN_PARSE_PROMPT },
            { role: 'user', content: profileText },
          ],
          responseSchema: CvDataSchema,
          maxTokens: 3000,
        }),
      ]
    );
  }

  async importGitHub(userId: string, repos: Array<{ name: string; description: string | null; html_url: string; language: string | null; stargazers_count: number }>): Promise<{ repos: GithubRepository[] }> {
    if (!(await this.checkRateLimit(userId, 'github_import'))) {
      throw new Error('Rate limit exceeded for GitHub import');
    }

    const repoText = repos.map(r => `${r.name}: ${r.description || 'No description'} (${r.language || 'Unknown'}) - ${r.html_url}`).join('\n');
    
    return this.withFallback(
      () => this.callModel({
        model: FREE_MODELS.TEXT,
        messages: [
          { role: 'system', content: GITHUB_IMPORT_PROMPT },
          { role: 'user', content: repoText },
        ],
        responseSchema: z.object({ repos: z.array(GithubRepositorySchema) }),
      }),
      [
        () => this.callModel({
          model: FREE_MODELS.LONG_CONTEXT,
          messages: [
            { role: 'system', content: GITHUB_IMPORT_PROMPT },
            { role: 'user', content: repoText },
          ],
          responseSchema: z.object({ repos: z.array(GithubRepositorySchema) }),
        }),
      ]
    );
  }

  async importWeb(userId: string, url: string, html: string): Promise<{
    title: string;
    description: string;
    tags: string[];
    content_md: string;
  }> {
    if (!(await this.checkRateLimit(userId, 'web_import'))) {
      throw new Error('Rate limit exceeded for web import');
    }

    return this.withFallback(
      () => this.callModel({
        model: FREE_MODELS.LONG_CONTEXT,
        messages: [
          { role: 'system', content: WEB_IMPORT_PROMPT },
          { role: 'user', content: `URL: ${url}\n\nHTML:\n${html.slice(0, 15000)}` },
        ],
        responseSchema: z.object({
          title: z.string(),
          description: z.string(),
          tags: z.array(z.string()),
          content_md: z.string(),
        }),
      }),
      [
        () => this.callModel({
          model: FREE_MODELS.TEXT,
          messages: [
            { role: 'system', content: WEB_IMPORT_PROMPT },
            { role: 'user', content: `URL: ${url}\n\nHTML:\n${html.slice(0, 15000)}` },
          ],
          responseSchema: z.object({
            title: z.string(),
            description: z.string(),
            tags: z.array(z.string()),
            content_md: z.string(),
          }),
        }),
      ]
    );
  }

  async suggestContent(userId: string, input: {
    profession?: string;
    cvData?: string;
    linkedInData?: string;
    githubProjectsData?: string;
  }): Promise<AIContentSuggestions> {
    if (!(await this.checkRateLimit(userId, 'content_suggest'))) {
      throw new Error('Rate limit exceeded for content suggestions');
    }

    const dataText = [
      input.cvData ? `CV: ${input.cvData}` : null,
      input.linkedInData ? `LinkedIn: ${input.linkedInData}` : null,
      input.githubProjectsData ? `GitHub: ${input.githubProjectsData}` : null,
    ].filter(Boolean).join('\n\n');

    return this.withFallback(
      () => this.callModel({
        model: FREE_MODELS.CREATIVE,
        messages: [
          { role: 'system', content: CONTENT_SUGGEST_PROMPT },
          { role: 'user', content: `Profession: ${input.profession ?? 'Not specified'}\n\n${dataText}` },
        ],
        responseSchema: AIContentSuggestionsSchema,
      }),
      [
        () => this.callModel({
          model: FREE_MODELS.TEXT,
          messages: [
            { role: 'system', content: CONTENT_SUGGEST_PROMPT },
            { role: 'user', content: `Profession: ${input.profession ?? 'Not specified'}\n\n${dataText}` },
          ],
          responseSchema: AIContentSuggestionsSchema,
        }),
      ]
    );
  }

  async generateTheme(userId: string, prompt: string): Promise<ThemeConfig> {
    if (!(await this.checkRateLimit(userId, 'theme_gen'))) {
      throw new Error('Rate limit exceeded for theme generation');
    }

    return this.withFallback(
      () => this.callModel({
        model: FREE_MODELS.CREATIVE,
        messages: [
          { role: 'system', content: THEME_GEN_PROMPT.replace('{{prompt}}', prompt) },
          { role: 'user', content: prompt },
        ],
        responseSchema: ThemeConfigSchema,
      }),
      [
        () => this.callModel({
          model: FREE_MODELS.TEXT,
          messages: [
            { role: 'system', content: THEME_GEN_PROMPT.replace('{{prompt}}', prompt) },
            { role: 'user', content: prompt },
          ],
          responseSchema: ThemeConfigSchema,
        }),
      ]
    );
  }

  async translate(userId: string, texts: string[], targetLanguage: string): Promise<TranslateOutput> {
    if (!(await this.checkRateLimit(userId, 'translate'))) {
      throw new Error('Rate limit exceeded for translation');
    }

    return this.withFallback(
      () => this.callModel({
        model: FREE_MODELS.TEXT,
        messages: [
          { role: 'system', content: TRANSLATE_PROMPT(targetLanguage).replace('{{JSON.stringify texts}}', JSON.stringify(texts)) },
          { role: 'user', content: JSON.stringify(texts) },
        ],
        responseSchema: TranslateOutputSchema,
      }),
      [
        () => this.callModel({
          model: FREE_MODELS.CREATIVE,
          messages: [
            { role: 'system', content: TRANSLATE_PROMPT(targetLanguage).replace('{{JSON.stringify texts}}', JSON.stringify(texts)) },
            { role: 'user', content: JSON.stringify(texts) },
          ],
          responseSchema: TranslateOutputSchema,
        }),
      ]
    );
  }

  async summarizeReadme(userId: string, readmeContent: string): Promise<string> {
    if (!(await this.checkRateLimit(userId, 'readme_summary'))) {
      throw new Error('Rate limit exceeded for README summarization');
    }

    return this.withFallback(
      () => this.callModel({
        model: FREE_MODELS.TEXT,
        messages: [
          { role: 'system', content: README_SUMMARY_PROMPT },
          { role: 'user', content: readmeContent.slice(0, 10000) },
        ],
        responseSchema: z.string(),
        maxTokens: 200,
      }),
      [
        () => this.callModel({
          model: FREE_MODELS.CREATIVE,
          messages: [
            { role: 'system', content: README_SUMMARY_PROMPT },
            { role: 'user', content: readmeContent.slice(0, 10000) },
          ],
          responseSchema: z.string(),
          maxTokens: 200,
        }),
      ]
    );
  }
}

export const openrouterAI = new OpenRouterAI();