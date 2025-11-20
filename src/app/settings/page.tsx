+
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, updateDoc } from "firebase/firestore";
import { Check, Loader2, KeyRound, Copy, Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { themes as staticThemes } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemePreview } from "@/components/theme-preview";
import { Textarea } from "@/components/ui/textarea";
import { ThemeConfig } from "@/lib/theme-schema";
import { logger } from "@/lib/logger";

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
};

type UserProfile = {
    id: string;
    themeId?: string;
    customDomain?: string;
    customDomainStatus?: 'pending' | 'active' | 'error';
    customTheme?: ThemeConfig;
};

const convertThemeConfigToTheme = (config: ThemeConfig): Theme => {
  return {
    id: 'custom',
    name: config.name,
    description: config.description,
    previewImageUrl: '', // No image for generated themes
    price: 0,
    isPremium: true, // AI generation can be considered a premium feature
    // Using light theme for the preview for consistency
    background: config.light.background,
    foreground: config.light.foreground,
    primary: config.light.primary,
    accent: config.light.accent,
  };
};

export default function SettingsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const isReadOnly = !user || user.isAnonymous;
  
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [domainName, setDomainName] = useState('');
  const [isConnectingDomain, setIsConnectingDomain] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedTheme, setGeneratedTheme] = useState<ThemeConfig | null>(null);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);

  const themesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'themes');
  }, [firestore]);

  const { data: themes, isLoading: areThemesLoading } = useCollection<Theme>(themesQuery);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore || user.isAnonymous) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
      if (userProfile?.themeId) {
          setSelectedThemeId(userProfile.themeId);
      }
      if (userProfile?.customDomain) {
          setDomainName(userProfile.customDomain);
      }
      if (userProfile?.customTheme) {
          setGeneratedTheme(userProfile.customTheme);
      }
  }, [userProfile]);

  const displayedThemes = useMemo(() => {
    return themes && themes.length > 0 ? themes : staticThemes;
  }, [themes]);

  const handleSelectTheme = (themeId: string) => {
    if (isReadOnly) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in or sign up to change your theme.",
      });
      return;
    }
    setSelectedThemeId(themeId);
    setGeneratedTheme(null); // Clear generated theme when selecting a pre-made one
  };
  
  const handleSaveTheme = async () => {
    if (!userProfileRef || (!selectedThemeId && !generatedTheme)) return;

    setIsSaving(true);
    try {
      const themeToSave = generatedTheme ? { customTheme: generatedTheme, themeId: 'custom' } : { themeId: selectedThemeId, customTheme: null };
      await updateDoc(userProfileRef, themeToSave);
      toast({
        title: "Theme Updated!",
        description: "Your portfolio will now use the new theme.",
      });
    } catch (error) {
      logger.error("Error saving theme:", { error });
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save theme selection. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectDomain = async () => {
      if (!userProfileRef || !domainName) {
           toast({
                variant: "destructive",
                title: "Invalid Domain",
                description: "Please enter a valid domain name.",
            });
        return;
      }

      setIsConnectingDomain(true);
      try {
          await updateDoc(userProfileRef, {
              customDomain: domainName,
              customDomainStatus: 'pending',
          });
          toast({
              title: "Domain Connection Initiated",
              description: `Verification process started for ${domainName}.`,
          });
      } catch (error) {
          logger.error("Error connecting domain:", { error });
          toast({
              variant: "destructive",
              title: "Connection Failed",
              description: "Could not initiate domain connection.",
          });
      } finally {
          setIsConnectingDomain(false);
      }
  };

  const handleGenerateTheme = async () => {
    if (!aiPrompt) return;
    setIsGeneratingTheme(true);
    try {
      const response = await fetch('/api/theme-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate theme');
      }
      const theme = await response.json();
      setGeneratedTheme(theme);
      setSelectedThemeId('custom'); // Select the new custom theme
    } catch (error) {
      logger.error("Error generating theme:", { error });
      toast({
        variant: "destructive",
        title: "Theme Generation Failed",
        description: "Could not generate a new theme. Please try a different prompt.",
      });
    } finally {
      setIsGeneratingTheme(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const isLoading = areThemesLoading || isUserLoading;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          Settings
        </h1>
      </div>

       {isReadOnly && (
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50">
            <CardHeader className="flex flex-row items-center gap-4">
                <KeyRound className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                <div>
                    <CardTitle className="font-headline text-yellow-800 dark:text-yellow-300">Read-Only Mode</CardTitle>
                    <CardDescription className="text-yellow-700 dark:text-yellow-400">
                        Please <Link href="/login" className="font-bold underline">log in</Link> or <Link href="/signup" className="font-bold underline">sign up</Link> to manage your settings.
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Custom Domain</CardTitle>
            <CardDescription>
              Connect a custom domain to your portfolio for a professional
              online presence. This is a premium feature.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full max-w-md items-center space-x-2">
              <Input 
                type="text" 
                placeholder="your-domain.com" 
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                disabled={isReadOnly || !!userProfile?.customDomain}
              />
              <Button onClick={handleConnectDomain} disabled={isReadOnly || isConnectingDomain || !!userProfile?.customDomain}>
                {isConnectingDomain && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect
              </Button>
            </div>
            {userProfile?.customDomainStatus === 'pending' && (
                <Alert className="mt-4">
                    <AlertTitle className="font-headline">Verify Your Domain</AlertTitle>
                    <AlertDescription>
                        <p>To complete the connection, add the following TXT record to your domain's DNS settings.</p>
                        <div className="mt-2 space-y-2 text-sm">
                            <div><strong>Type:</strong> TXT</div>
                            <div><strong>Host/Name:</strong> @ or your-domain.com</div>
                            <div className="flex items-center gap-2">
                                <strong>Value:</strong>
                                <code className="bg-muted px-2 py-1 rounded-md text-xs truncate">
                                    {`portfolioforge-verification=${user?.uid}`}
                                </code>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(`portfolioforge-verification=${user?.uid}`)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">DNS changes can take up to 24 hours to propagate. We will check for the record automatically.</p>
                    </AlertDescription>
                </Alert>
            )}
             {userProfile?.customDomainStatus === 'active' && (
                <Alert variant="default" className="mt-4 border-green-500 text-green-700">
                    <Check className="h-4 w-4 !text-green-500" />
                    <AlertTitle className="font-headline text-green-800">Domain Active</AlertTitle>
                    <AlertDescription>
                        Your domain <a href={`https://${userProfile.customDomain}`} target="_blank" rel="noopener noreferrer" className="font-bold underline">{userProfile.customDomain}</a> is successfully connected and pointing to your portfolio.
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              After connecting, you will need to update your DNS records.
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
              <CardTitle className="font-headline">AI Theme Generator</CardTitle>
              <CardDescription>
                  Describe the style you want, and our AI will create a unique theme for you. Try things like "a minimalist theme with a touch of neon" or "a professional theme for a photographer".
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <Textarea
                  placeholder="e.g., A dark, futuristic theme with glowing blue accents..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={isReadOnly || isGeneratingTheme}
              />
              <Button onClick={handleGenerateTheme} disabled={isReadOnly || !aiPrompt || isGeneratingTheme}>
                  {isGeneratingTheme ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Generate Theme
              </Button>

              {generatedTheme && (
                  <div className="space-y-4 rounded-lg border p-4">
                      <h3 className="font-headline text-lg">Generated Theme Preview</h3>
                      <ThemePreview theme={convertThemeConfigToTheme(generatedTheme)} />
                  </div>
              )}
          </CardContent>
        </Card>

        <Dialog
            open={!!previewTheme}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setPreviewTheme(null);
                }
            }}
        >
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Portfolio Themes</CardTitle>
                <CardDescription>
                Choose a theme to change the look and feel of your live portfolio. Click to preview.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {generatedTheme && (
                  <div key="custom" className="relative" onClick={() => setSelectedThemeId('custom')}>
                    <Card 
                        className={`overflow-hidden cursor-pointer transition-all ${selectedThemeId === 'custom' ? 'ring-2 ring-primary ring-offset-2' : 'ring-0'}`}
                    >
                        <ThemePreview theme={convertThemeConfigToTheme(generatedTheme)} />
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
                        <div key={theme.id} className="relative" onClick={() => handleSelectTheme(theme.id)}>
                            <DialogTrigger asChild onClick={() => setPreviewTheme(theme)}>
                                <Card 
                                    className={`overflow-hidden cursor-pointer transition-all ${selectedThemeId === theme.id ? 'ring-2 ring-primary ring-offset-2' : 'ring-0'}`}
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
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? "Saving..." : "Save Selection"}
                </Button>
            </CardFooter>
            </Card>
            <DialogContent
                className="max-w-4xl w-full h-[90vh] flex flex-col"
            >
                {previewTheme && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Theme Preview: {previewTheme.name}</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-auto rounded-lg border">
                            <ThemePreview theme={previewTheme} />
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
