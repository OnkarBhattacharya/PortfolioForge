
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
import { useFirebase, useUser, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, updateDoc } from "firebase/firestore";
import { Check, Loader2, KeyRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { themes as staticThemes } from "@/lib/data";

type Theme = {
  id: string;
  name: string;
  description: string;
  previewImageUrl: string;
  price: number;
  isPremium: boolean;
};

type UserProfile = {
    id: string;
    themeId?: string;
};

export default function SettingsPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const isReadOnly = !user || user.isAnonymous;
  
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
  }, [userProfile]);


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
  };
  
  const handleSaveTheme = async () => {
    if (!userProfileRef || !selectedThemeId) return;

    setIsSaving(true);
    try {
      await updateDoc(userProfileRef, { themeId: selectedThemeId });
      toast({
        title: "Theme Updated!",
        description: "Your portfolio will now use the new theme.",
      });
    } catch (error) {
      console.error("Error saving theme:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save theme selection. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = areThemesLoading || isUserLoading;
  const displayedThemes = themes && themes.length > 0 ? themes : staticThemes;


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
              online presence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full max-w-md items-center space-x-2">
              <Input type="text" placeholder="your-domain.com" disabled={isReadOnly} />
              <Button type="submit" disabled={isReadOnly}>Connect</Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              After connecting, you will need to update your DNS records.
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Portfolio Themes</CardTitle>
            <CardDescription>
              Choose a theme to change the look and feel of your live portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                <div key={theme.id} className="relative">
                  <Card 
                    className={`overflow-hidden cursor-pointer transition-all ${selectedThemeId === theme.id ? 'ring-2 ring-primary ring-offset-2' : 'ring-0'}`}
                    onClick={() => handleSelectTheme(theme.id)}
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
                      <p className="mt-2 font-semibold">{theme.isPremium ? `$${theme.price}` : 'Free'}</p>
                    </div>
                  </Card>
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
              <Button onClick={handleSaveTheme} disabled={isSaving || !selectedThemeId || isReadOnly}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Selection"}
              </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
