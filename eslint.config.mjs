import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import typescriptEslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-html-link-for-pages': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**'],
  },
];