import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * A simple helper to extract the text from a Genkit Part.
 *
 * @param {PartLike} part - The part to extract text from.
 * @returns {string} The extracted text.
 */
export function getText(part: any): string {
  if (part.text) {
    return part.text;
  }
  if (part.content) {
    return part.content.map(getText).join('');
  }
  return '';
}
