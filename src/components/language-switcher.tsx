
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

export function LanguageSwitcher() {
  const { supportedLanguages, translatePage, isTranslating } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    if (languageCode) {
      translatePage(languageCode);
    }
  };

  return (
    <Select onValueChange={handleLanguageChange} disabled={isTranslating}>
      <SelectTrigger className="w-auto h-9 border-0 bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground">
        <SelectValue placeholder={<Languages className="h-5 w-5" />} />
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
