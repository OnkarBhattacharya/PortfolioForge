'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { themes as staticThemes } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ThemePreview } from '@/components/theme-preview';
import { Textarea } from '@/components/ui/textarea';
import { ThemeConfig } from '@/lib/theme-schema';
import { useUser } from '@/hooks/use-supabase';
import { useSupabase } from '@/hooks/use-supabase';
import { Loader2, Check, Link, Copy, KeyRound, Wand2, Image as LucideImage } from 'lucide-react';
import Image from 'next/image';

type Theme = {
  id: string;
  name: string;
  description: string;
  previewImageUrl: string;
  price: number;
  isPremium: boolean;
  background: string;
  foreground: string;
  primary: string;
  accent: string;
  css_vars?: Record<string, string>;
};

type UserProfile = {
  id: string;
  username?: string;
  themeId?: string;
  customDomain?: string;
  customDomainStatus?: 'pending' | 'active' | 'error';
  customTheme?: ThemeConfig;
  subscriptionTier?: 'free' | 'pro' | 'studio';
};

const convertThemeConfigToTheme = (config: ThemeConfig): Theme => {
  return {
    id: 'custom',
    name: config.name,
    description: config.description,
    previewImageUrl: '',
    price: 0,
    isPremium: true,
    background: config.light.background,
    foreground: config.light.foreground,
    primary: config.light.primary,
    accent: config.light.accent,
  };
};

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const supabase = useSupabase();
  const { toast } = useToast();

  const isReadOnly = !user;
  const [isMounted, setIsMounted] = useState(false);

  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [domainName, setDomainName] = useState('');
  const [isConnectingDomain, setIsConnectingDomain] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedTheme, setGeneratedTheme] = useState<ThemeConfig | null>(null);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [themes, setThemes] = useState<Theme[]>([]);
  const [areThemesLoading, setAreThemesLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch user profile
  useEffect(() => {
    if (!user || isReadOnly) {
      setProfile(null);
      setIsProfileLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (!error && data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, isReadOnly]);

  // Fetch themes
  useEffect(() => {
    const fetchThemes = async () => {
      setAreThemesLoading(true);
      try {
        const { data, error } = await supabase
          .from('themes')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data) {
          setThemes(data);
        }
      } catch (error) {
        console.error('Failed to fetch themes:', error);
      } finally {
        setAreThemesLoading(false);
      }
    };

    fetchThemes();
  }, []);

  useEffect(() => {
    if (profile?.themeId) {
      setSelectedThemeId(profile.themeId);
    }
    if (profile?.customDomain) {
      setDomainName(profile.customDomain);
    }
    if (profile?.customTheme) {
      setGeneratedTheme(profile.customTheme);
    }
  }, [profile]);

  const displayedThemes = useMemo(() => {
    return themes && themes.length > 0 ? themes : staticThemes;
  }, [themes]);

  const isLoading = areThemesLoading || isUserLoading || (!isReadOnly && isProfileLoading);
  const isPro = profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'studio';

  const handleSelectTheme = (themeId: string, isPremium: boolean) => {
    if (isPremium && !isPro) {
      toast({
        title: 'Premium Theme',
        description: 'Upgrade to Pro or Studio to use this theme.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedThemeId(themeId);
  };

  const handleSaveTheme = async () => {
    if (!user || isReadOnly) return;

    setIsSaving(true);
    try {
      const updateData: Record<string, unknown> = {};
      if (selectedThemeId) {
        updateData.theme_id = selectedThemeId;
      }
      if (generatedTheme && selectedThemeId === 'custom') {
        updateData.custom_theme = generatedTheme;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Theme Saved',
        description: 'Your portfolio theme has been updated.',
      });
    } catch (error) {
      console.error('Failed to save theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to save theme. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectDomain = async () => {
    if (!domainName.trim()) return;

    setIsConnectingDomain(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ custom_domain: domainName.trim() })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Domain Connected',
        description: `${domainName} has been connected to your portfolio.`,
      });
    } catch (error) {
      console.error('Failed to connect domain:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect domain. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConnectingDomain(false);
    }
  };

  const handleGenerateTheme = async () => {
    if (!aiPrompt.trim()) return;

    setIsGeneratingTheme(true);
    try {
      const response = await fetch('/api/ai/theme-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to generate theme');

      setGeneratedTheme(result.data);
      setSelectedThemeId('custom');
      toast({
        title: 'Theme Generated',
        description: 'Your custom theme has been created.',
      });
    } catch (error) {
      console.error('Failed to generate theme:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate theme.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  const handleCopyLink = () => {
    if (profile?.username) {
      const url = `${window.location.origin}/${profile.username}`;
      navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied',
        description: 'Portfolio link copied to clipboard.',
      });
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your portfolio settings and appearance.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme Selection</CardTitle>
          <CardDescription>Choose a theme to change the look and feel of your live portfolio. Click to preview.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {generatedTheme && (
            <div key="custom" className="relative" onClick={() => setSelectedThemeId('custom')}>
              <Card className={`overflow-hidden cursor-pointer transition-all ${selectedThemeId === 'custom' ? 'ring-2 ring-primary ring-offset-2' : 'ring-0'}`}>
                <ThemePreview theme={convertThemeConfigToTheme(generatedTheme)} showBranding={!isPro} />
                <div className="p-4">
                  <div className="font-bold text-lg">Your AI Theme</div>
                  <p className="text-sm text-muted-foreground h-10">The custom theme generated by AI.</p>
                </div>
              </Card>
              {selectedThemeId === 'custom' && (
                <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          )}
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-video w-full rounded-md bg-muted animate-pulse" />
                <div className="h-5 w-3/4 rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-1/2 rounded-md bg-muted animate-pulse" />
              </div>
            ))
          ) : (
            displayedThemes.map((theme) => (
              <div
                key={theme.id}
                className="relative"
                onClick={() => handleSelectTheme(theme.id, theme.isPremium)}
              >
                <DialogTrigger asChild onClick={() => setPreviewTheme(theme)}>
                  <Card
                    className={`overflow-hidden cursor-pointer transition-all ${
                      selectedThemeId === theme.id ? 'ring-2 ring-primary ring-offset-2' : 'ring-0'
                    } ${theme.isPremium && !isPro ? 'opacity-60' : ''}`}
                  >
                    <Image
                      src={theme.previewImageUrl}
                      alt={theme.name}
                      width={600}
                      height={400}
                      className="aspect-video w-full object-cover"
                    />
                    <div className="p-4">
                      <div className="font-bold text-lg">{theme.name}</div>
                      <p className="text-sm text-muted-foreground h-10">{theme.description}</p>
                    </div>
                  </Card>
                </DialogTrigger>
                {theme.isPremium && !isPro && (
                  <div className="absolute inset-0 flex items-start justify-end p-3 pointer-events-none">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Pro
                    </span>
                  </div>
                )}
                {selectedThemeId === theme.id && (
                  <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveTheme} disabled={isSaving || (!selectedThemeId && !generatedTheme) || isReadOnly}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Selection'
            )}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={!!previewTheme} onOpenChange={(open) => !open && setPreviewTheme(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col">
          {previewTheme && (
            <>
              <DialogHeader>
                <DialogTitle>Theme Preview: {previewTheme.name}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-auto rounded-lg border">
                <ThemePreview theme={previewTheme} showBranding={!isPro} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Theme Generator
          </CardTitle>
          <CardDescription>Generate a custom theme using AI. Available on Pro and Studio plans.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPro ? (
            <>
              <Textarea
                placeholder="Describe your ideal theme... (e.g., 'Dark cyberpunk theme with neon green accents and monospace fonts')"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[100px]"
                disabled={isGeneratingTheme}
              />
              <Button
                onClick={handleGenerateTheme}
                disabled={!aiPrompt.trim() || isGeneratingTheme || isReadOnly}
              >
                {isGeneratingTheme ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Theme'
                )}
              </Button>
            </>
          ) : (
            <Alert variant="default">
              <AlertTitle>Upgrade Required</AlertTitle>
              <AlertDescription>
                AI theme generation is available on Pro and Studio plans.{' '}
                <a href="/billing" className="underline">
                  Upgrade now
                </a>
                {' '}to unlock this feature.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Custom Domain
            </CardTitle>
            <CardDescription>Connect a custom domain to your portfolio. Available on Pro and Studio plans.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPro ? (
              <div className="flex gap-2">
                <Input
                  placeholder="yourdomain.com"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  disabled={isConnectingDomain}
                />
                <Button onClick={handleConnectDomain} disabled={!domainName.trim() || isConnectingDomain || isReadOnly}>
                  {isConnectingDomain ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect Domain'
                  )}
                </Button>
              </div>
            ) : (
              <Alert variant="default">
                <AlertTitle>Upgrade Required</AlertTitle>
                <AlertDescription>
                  Custom domains are available on Pro and Studio plans.{' '}
                  <a href="/billing" className="underline">
                    Upgrade now
                  </a>
                  {' '}to unlock this feature.
                </AlertDescription>
              </Alert>
            )}
            {profile.customDomain && (
              <div className="text-sm text-muted-foreground">
                Current domain: <span className="font-medium">{profile.customDomain}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {profile?.username && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Portfolio Link
            </CardTitle>
            <CardDescription>Share your portfolio with the world.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Input
              readOnly
              value={`${window.location.origin}/${profile.username}`}
              className="flex-1"
            />
            <Button variant="outline" onClick={handleCopyLink} size="icon">
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy link</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}