
import { z } from 'zod';

export const ThemeColorSchema = z.object({
  background: z.string().describe('The background color, e.g., hsl(0 0% 100%)'),
  foreground: z.string().describe('The foreground color, e.g., hsl(222.2 84% 4.9%)'),
  card: z.string().describe('The card background color, e.g., hsl(0 0% 100%)'),
  cardForeground: z.string().describe('The card foreground color, e.g., hsl(222.2 84% 4.9%)'),
  popover: z.string().describe('The popover background color, e.g., hsl(0 0% 100%)'),
  popoverForeground: z.string().describe('The popover foreground color, e.g., hsl(222.2 84% 4.9%)'),
  primary: z.string().describe('The primary color, e.g., hsl(222.2 47.4% 11.2%)'),
  primaryForeground: z.string().describe('The primary foreground color, e.g., hsl(210 40% 98%)'),
  secondary: z.string().describe('The secondary color, e.g., hsl(210 40% 96.1%)'),
  secondaryForeground: z.string().describe('The secondary foreground color, e.g., hsl(222.2 47.4% 11.2%)'),
  muted: z.string().describe('The muted color, e.g., hsl(210 40% 96.1%)'),
  mutedForeground: z.string().describe('The muted foreground color, e.g., hsl(215.4 16.3% 46.9%)'),
  accent: z.string().describe('The accent color, e.g., hsl(210 40% 96.1%)'),
  accentForeground: z.string().describe('The accent foreground color, e.g., hsl(222.2 47.4% 11.2%)'),
  destructive: z.string().describe('The destructive color, e.g., hsl(0 84.2% 60.2%)'),
  destructiveForeground: z.string().describe('The destructive foreground color, e.g., hsl(210 40% 98%)'),
  border: z.string().describe('The border color, e.g., hsl(214.3 31.8% 91.4%)'),
  input: z.string().describe('The input border color, e.g., hsl(214.3 31.8% 91.4%)'),
  ring: z.string().describe('The ring color, e.g., hsl(222.2 84% 4.9%)'),
});

export const ThemeFontSchema = z.object({
  family: z.string().describe('The font family, e.g., "Inter", "Poppins"'),
  variants: z.array(z.string()).describe('The font variants to load, e.g., ["400", "700"]'),
  url: z.string().url().describe('The URL to the Google Fonts CSS file.'),
});

export const ThemeConfigSchema = z.object({
  name: z.string().describe('A creative and descriptive name for the theme.'),
  description: z.string().describe('A brief description of the theme\'s style and feel.'),
  light: ThemeColorSchema.describe('The color palette for the light mode.'),
  dark: ThemeColorSchema.describe('The color palette for the dark mode.'),
  font: z.object({
    heading: ThemeFontSchema.describe('The font for headings.'),
    body: ThemeFontSchema.describe('The font for body text.'),
  }),
  borderRadius: z.number().min(0).max(1).describe('The border radius for elements, from 0 to 1 rem.'),
});

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;
