
'use client';

import { useState } from 'react';
import { useToast } from './use-toast';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
];

const IGNORED_TAGS = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE'];

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const translatePage = async (targetLanguage: string) => {
    setIsTranslating(true);
    toast({
      title: 'Translating...',
      description: `Please wait while we translate the page to ${SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.name}.`,
    });

    try {
      const textNodes: { node: Node; originalText: string }[] = [];
      
      const walk = (node: Node) => {
        if (node.nodeType === 3) { // Text node
          const text = node.nodeValue?.trim();
          if (text && text.length > 1) { // Only translate non-empty strings
             textNodes.push({ node, originalText: text });
          }
        } else if (node.nodeType === 1 && !IGNORED_TAGS.includes((node as Element).tagName)) {
           // Also consider direct text content of elements that don't have text node children for some reason
           const element = node as Element;
           if(element.childNodes.length === 1 && element.childNodes[0].nodeType === 3 && (element.childNodes[0].nodeValue?.trim() ?? '').length > 1) {
             // already handled by text node logic
           } else if (element.textContent && element.childNodes.length === 0) {
             const text = element.textContent.trim();
             if (text && text.length > 1) {
                textNodes.push({ node, originalText: text });
             }
           }
          
           node.childNodes.forEach(walk);
        }
      };

      walk(document.body);

      const textsToTranslate = textNodes.map(tn => tn.originalText);
      
      if (textsToTranslate.length === 0) {
          toast({ title: "Nothing to translate." });
          return;
      }
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: textsToTranslate,
          targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation API request failed');
      }

      const { translations } = await response.json();

      if (translations.length !== textNodes.length) {
          throw new Error("Translation count mismatch.");
      }

      requestAnimationFrame(() => {
          textNodes.forEach(({ node }, index) => {
            node.nodeValue = translations[index];
          });
      });

      toast({
        title: 'Translation Complete!',
        description: `Page has been translated.`,
      });

    } catch (error) {
      console.error('Translation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Translation Failed',
        description: 'Could not translate the page. Please try again.',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    supportedLanguages: SUPPORTED_LANGUAGES,
    isTranslating,
    translatePage,
  };
}
