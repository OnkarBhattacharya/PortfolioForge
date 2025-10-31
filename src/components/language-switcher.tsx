
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import { Languages } from 'lucide-react';
import { useState } from 'react';

export function LanguageSwitcher() {
  const { supportedLanguages, translatePage, isTranslating } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleLanguageChange = (languageCode: string) => {
    if (languageCode) {
      translatePage(languageCode);
      setSelectedLanguage(languageCode);
    }
  };

  return (
    <Select onValueChange={handleLanguageChange} disabled={isTranslating}>
      <SelectTrigger className="w-auto h-9 border-0 bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground pr-2">
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
