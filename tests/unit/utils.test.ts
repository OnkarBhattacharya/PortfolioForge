import { cn } from '@/lib/utils';

/**
 * @file Unit Tests for Utility Functions
 * @description
 * Unit tests focus on the smallest pieces of testable software in an application
 * to verify they work as expected in isolation. For our application, this includes
 * testing utility functions like `cn` from `src/lib/utils.ts`.
 */

describe('cn utility function', () => {
  it('should merge tailwind classes correctly', () => {
    // It should combine simple classes
    expect(cn('p-4', 'm-2')).toBe('p-4 m-2');

    // It should handle conditional classes
    expect(cn('p-4', { 'm-2': true, 'text-red-500': false })).toBe('p-4 m-2');

    // It should override conflicting classes, keeping the last one
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-black', 'text-white')).toBe('text-white');
  });

  it('should handle various types of input', () => {
    // It should handle null and undefined gracefully
    expect(cn('p-4', null, 'm-2', undefined)).toBe('p-4 m-2');

    // It should handle arrays of classes
    expect(cn(['p-4', 'm-2'], ['bg-red-500'])).toBe('p-4 m-2 bg-red-500');
  });
});
