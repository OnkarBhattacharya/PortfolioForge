import { createClient } from '@/lib/supabase/server';
import { themes as staticThemes } from '@/lib/data';
import { z } from 'zod';
import { CvDataSchema } from '@/lib/types';
import { FreelancerTheme } from './freelancer-theme';
import { AgencyTheme } from './agency-theme';
import { StylishPortfolioTheme } from './stylish-portfolio-theme';
import { ThemeConfig } from '@/lib/theme-schema';
import { ContactForm } from './contact-form';

type CvData = z.infer<typeof CvDataSchema>;

// Types that match what the themes expect (camelCase)
export type UserProfile = {
  id: string;
  username?: string;
  fullName?: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  links?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  // Separate fields that themes expect
  linkedinUrl?: string;
  githubUrl?: string;
  email?: string;
  location?: string;
  themeId?: string;
  customTheme?: ThemeConfig;
  subscriptionTier?: 'free' | 'pro' | 'studio';
  summary?: string;
  experience?: any[];
  education?: any[];
  skills?: string[];
} & Partial<CvData>;

export type PortfolioItem = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  itemUrl?: string;
  imageId?: string;
};

export default async function PortfolioPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();

  // Fetch user profile by username or id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .or(`id.eq.${userId},username.eq.${userId}`)
    .single();

  if (profileError || !profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Portfolio Not Found</h1>
          <p className="text-muted-foreground">This user profile could not be loaded.</p>
        </div>
      </div>
    );
  }

  // Fetch theme if not custom
  let theme = null;
  if (profile.theme_id && profile.theme_id !== 'custom') {
    const { data } = await supabase
      .from('themes')
      .select('*')
      .eq('id', profile.theme_id)
      .single();
    theme = data;
  }

  // Fetch portfolio items
  const { data: items, error: itemsError } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('user_id', profile.id)
    .order('sort_order', { ascending: true });

  const fallbackTheme = staticThemes.find((themeItem) => themeItem.id === 'freelancer-teal') || staticThemes[0];

  const selectedTheme = profile.custom_theme
    ? profile.custom_theme
    : profile.theme_id && profile.theme_id !== 'custom'
      ? theme || staticThemes.find((themeItem) => themeItem.id === profile.theme_id) || fallbackTheme
      : fallbackTheme;

  const selectedThemeStyles = selectedTheme as {
    light?: Record<string, string>;
    primary?: string;
    font?: {
      heading: { family: string; url: string };
      body: { family: string; url: string };
    };
    borderRadius?: number;
    css_vars?: Record<string, string>;
  };

  // Map database fields to theme-expected camelCase
  const mappedItems = (items || []).map((item) => ({
    id: item.id,
    name: item.title,
    description: item.description || '',
    tags: item.tags || [],
    itemUrl: item.project_url || item.repo_url,
    imageId: item.image_url || 'project-1',
  }));

  const mappedProfile = {
    id: profile.id,
    username: profile.username,
    fullName: profile.full_name,
    headline: profile.headline,
    bio: profile.bio,
    avatarUrl: profile.avatar_url,
    links: profile.links,
    linkedinUrl: profile.links?.linkedin,
    githubUrl: profile.links?.github,
    themeId: profile.theme_id,
    customTheme: profile.custom_theme,
    subscriptionTier: profile.subscription_tier,
    email: profile.email,
    location: profile.location,
    summary: profile.summary,
    experience: profile.experience,
    education: profile.education,
    skills: profile.skills,
  };

  const themeProps = { profile: mappedProfile, items: mappedItems, theme: selectedTheme };

  if (profile.theme_id === 'agency') {
    return <AgencyTheme {...themeProps} />;
  }

  if (profile.theme_id === 'stylish-portfolio') {
    return <StylishPortfolioTheme {...themeProps} />;
  }

  return <FreelancerTheme {...themeProps} />;
}