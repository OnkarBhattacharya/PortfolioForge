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
    logger.error('Error in ai-powered-content-suggestions API:', { 
      error: error.message, 
      stack: error.stack 
    });
    return NextResponse.json(
      { error: 'Failed to generate suggestions' }, 
      { status: 500 }
    );
  }
}
