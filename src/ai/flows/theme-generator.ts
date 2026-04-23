import { getAi, z } from '@/ai/genkit';
import { ThemeConfigSchema } from '@/lib/theme-schema';

export const ThemeGeneratorInputSchema = z.object({
  prompt: z.string().describe('A user-provided text prompt describing the desired theme style.'),
});

export type ThemeGeneratorInput = z.infer<typeof ThemeGeneratorInputSchema>;
export type ThemeGeneratorOutput = z.infer<typeof ThemeConfigSchema>;

export async function themeGeneratorFlow(input: ThemeGeneratorInput): Promise<ThemeGeneratorOutput> {
  const ai = getAi();
  const { output } = await ai.generate({
    prompt: `You are an expert theme designer. Your task is to generate a unique and visually appealing theme configuration based on the user's prompt. The output must be a valid JSON object that conforms to the provided schema.

User Prompt: "${input.prompt}"`,
    output: { schema: ThemeConfigSchema },
    config: { temperature: 0.8 },
  });

  if (!output) {
    throw new Error('Failed to generate theme. The model did not return a valid configuration.');
  }
  return output;
}
