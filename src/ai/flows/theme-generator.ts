
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ThemeConfigSchema } from '@/lib/theme-schema';

export const ThemeGeneratorInputSchema = z.object({
  prompt: z.string().describe('A user-provided text prompt describing the desired theme style.'),
});

export type ThemeGeneratorInput = z.infer<typeof ThemeGeneratorInputSchema>;
export type ThemeGeneratorOutput = z.infer<typeof ThemeConfigSchema>;

export const themeGeneratorFlow = ai.defineFlow(
  {
    name: 'themeGeneratorFlow',
    inputSchema: ThemeGeneratorInputSchema,
    outputSchema: ThemeConfigSchema,
  },
  async ({ prompt }) => {
    const { output } = await ai.generate({
      prompt: `You are an expert theme designer. Your task is to generate a unique and visually appealing theme configuration based on the user's prompt. The output must be a valid JSON object that conforms to the provided schema.

User Prompt: "${prompt}"`,
      model: 'googleai/gemini-1.5-pro',
      output: {
        schema: ThemeConfigSchema,
      },
      config: {
        temperature: 0.8, // Encourage creative and diverse outputs
      },
    });

    if (!output) {
      throw new Error('Failed to generate theme. The model did not return a valid configuration.');
    }

    return output;
  }
);
