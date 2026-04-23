'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { supportedLanguages, translatePage, isTranslating } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);

    if (typeof document !== 'undefined' && document.documentElement.lang) {
      const currentLanguage = document.documentElement.lang;
      if (!currentLanguage.toLowerCase().startsWith('en')) {
        setSelectedLanguage(currentLanguage);
      }
    }
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    if (!languageCode) {
      return;
    }

    translatePage(languageCode);
    setSelectedLanguage(languageCode);
  };

  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground"
        disabled
        aria-label="Language switcher loading"
      >
        <Languages className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Select onValueChange={handleLanguageChange} disabled={isTranslating}>
      <SelectTrigger className="h-9 w-auto border-0 bg-transparent pr-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
        {selectedLanguage ? (
          <span className="text-xs font-bold uppercase">{selectedLanguage}</span>
        ) : (
          <Languages className="h-5 w-5" />
        )}
      </SelectTrigger>
      <SelectContent>
        {supportedLanguages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}