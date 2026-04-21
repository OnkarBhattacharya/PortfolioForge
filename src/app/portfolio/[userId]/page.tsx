
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo } from 'react';
import {
  collection,
  doc,
  query,
} from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { themes as staticThemes } from '@/lib/data';
import { z } from 'zod';
import { CvDataSchema } from '@/lib/types';
import { FreelancerTheme } from './freelancer-theme';
import { AgencyTheme } from './agency-theme';
import { StylishPortfolioTheme } from './stylish-portfolio-theme';
import { ThemeConfig } from '@/lib/theme-schema';
import { ContactForm } from './contact-form';

type CvData = z.infer<typeof CvDataSchema>;

export type UserProfile = {
  id: string;
  fullName?: string;
  email?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  themeId?: string;
  customTheme?: ThemeConfig;
  subscriptionTier?: 'free' | 'pro' | 'studio';
} & Partial<CvData>;

export type PortfolioItem = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  itemUrl?: string;
  imageId: string;
};

export default function PortfolioPage({ params: { userId } }: { params: { userId: string } }) {
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);
  
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);

  const themeDocRef = useMemoFirebase(() => {
    if (!firestore || !profile?.themeId || profile.themeId === 'custom') return null;
    return doc(firestore, 'themes', profile.themeId);
  }, [firestore, profile?.themeId]);

  const { data: theme, isLoading: isThemeLoading } = useDoc<any>(themeDocRef);

  const itemsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'users', userId, 'portfolioItems'));
  }, [firestore, userId]);

  const { data: items, isLoading: areItemsLoading } = useCollection<PortfolioItem>(itemsQuery);
  
  const isLoading = isProfileLoading || isThemeLoading || areItemsLoading;
  
  const selectedTheme = useMemo(() => {
    if (profile?.customTheme) {
      return profile.customTheme;
    }
    const themeId = profile?.themeId || 'freelancer-teal';
    return staticThemes.find(t => t.id === themeId) || staticThemes.find(t => t.id === 'freelancer-teal')!;
  }, [profile]);


  useEffect(() => {
    if (selectedTheme) {
      const themeToApply = selectedTheme.light || selectedTheme; // Use light mode for custom themes for now
      Object.entries(themeToApply).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });

      if (selectedTheme.font) {
        const headingFont = selectedTheme.font.heading;
        const bodyFont = selectedTheme.font.body;

        document.documentElement.style.setProperty('--font-heading', headingFont.family);
        document.documentElement.style.setProperty('--font-body', bodyFont.family);

        // Load fonts from Google Fonts
        const link = document.createElement('link');
        link.href = selectedTheme.font.heading.url;
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        if (headingFont.url !== bodyFont.url) {
            const bodyLink = document.createElement('link');
            bodyLink.href = bodyFont.url;
            bodyLink.rel = 'stylesheet';
            document.head.appendChild(bodyLink);
        }
      }
      
      if (selectedTheme.borderRadius) {
        document.documentElement.style.setProperty('--border-radius', `${selectedTheme.borderRadius}rem`);
      }
    }

    return () => {
      // Cleanup logic if needed
    };
  }, [selectedTheme]);

  
  if (isLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center" style={{ backgroundColor: `hsl(${selectedTheme.primary})`}}>
              <Loader2 className="h-16 w-16 animate-spin text-white" />
          </div>
      )
  }

  if (profileError || !profile) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Portfolio Not Found</h1>
                <p className="text-muted-foreground">This user profile could not be loaded.</p>
              </div>
          </div>
      )
  }
  
  const themeProps = { profile, items: items || [], theme: selectedTheme };

  if (profile?.themeId === 'agency') {
    return <AgencyTheme {...themeProps} />;
  }
  
  if (profile?.themeId === 'stylish-portfolio') {
    return <StylishPortfolioTheme {...themeProps} />;
  }

  // Default to Freelancer theme, which will now be styled by the custom theme if present
  return <FreelancerTheme {...themeProps} />;
}
