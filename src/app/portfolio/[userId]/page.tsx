
'use client';
import { useEffect, useMemo } from 'react';
import {
  collection,
  doc,
  query,
} from 'firebase/firestore';
import { useFirebase, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { themes as staticThemes } from '@/lib/data';
import { z } from 'zod';
import { CvDataSchema } from '@/lib/types';
import { FreelancerTheme } from './freelancer-theme';
import { AgencyTheme } from './agency-theme';

type CvData = z.infer<typeof CvDataSchema>;

export type UserProfile = {
  id: string;
  fullName?: string;
  email?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  themeId?: string;
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
  const { firestore } = useFirebase();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);
  
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);

  const themeDocRef = useMemoFirebase(() => {
    if (!firestore || !profile?.themeId) return null;
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
    const themeId = profile?.themeId || 'freelancer-teal';
    return staticThemes.find(t => t.id === themeId) || staticThemes.find(t => t.id === 'freelancer-teal')!;
  }, [profile?.themeId]);


  useEffect(() => {
    if (selectedTheme) {
        document.documentElement.style.setProperty('--background', selectedTheme.background);
        document.documentElement.style.setProperty('--foreground', selectedTheme.foreground);
        document.documentElement.style.setProperty('--primary', selectedTheme.primary);
        document.documentElement.style.setProperty('--accent', selectedTheme.accent);
    }

    return () => {
        document.documentElement.style.removeProperty('--background');
        document.documentElement.style.removeProperty('--foreground');
        document.documentElement.style.removeProperty('--primary');
        document.documentElement.style.removeProperty('--accent');
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

  if (selectedTheme.id === 'agency') {
    return <AgencyTheme {...themeProps} />;
  }

  // Default to Freelancer theme
  return <FreelancerTheme {...themeProps} />;
}
