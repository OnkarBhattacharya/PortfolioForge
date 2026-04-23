export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { generatePortfolioContentSuggestions } from '@/ai/flows/ai-powered-content-suggestions';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const InputSchema = z.object({
  profession: z.string().optional(),
  cvData: z.string().optional(),
  linkedInData: z.string().optional(),
  githubProjectsData: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = InputSchema.parse(body);

    const result = await generatePortfolioContentSuggestions(input);
    return NextResponse.json(result);
  } catch (error: any) {
    const message = error?.message ?? 'Unknown error';

    logger.error('Error in ai-powered-content-suggestions API:', {
      error: message,
      stack: error?.stack,
    });

    const isValidationError =
      error?.name === 'ZodError' ||
      message.includes('Invalid') ||
      message.includes('required');

    const isAiConfigError =
      message.includes('GOOGLE_GENAI_API_KEY') ||
      message.includes('AI features disabled in this environment') ||
      message.includes('Model returned no output') ||
      message.includes('Failed to generate suggestions');

    return NextResponse.json(
      {
        error: isValidationError
          ? message
          : isAiConfigError
            ? 'AI suggestions are temporarily unavailable because the model is not configured in this environment.'
            : 'Portfolio content generation failed. Please try again later.',
      },
      { status: isValidationError ? 400 : isAiConfigError ? 503 : 500 }
    );
  }
}
