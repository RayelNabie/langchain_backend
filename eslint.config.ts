import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import {defineConfig} from 'eslint/config';
import stylisticTs from '@stylistic/eslint-plugin-ts';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'src/types/**',
    ],
    plugins: {
      js,
      '@stylistic/ts': stylisticTs,
    },
    extends: ['js/recommended'],
    languageOptions: {globals: globals.browser},
    rules: {
      '@stylistic/ts/indent': ['error', 2],
      '@stylistic/ts/quotes': ['error', 'single'],
      '@stylistic/ts/semi': ['error', 'always'],
    },
  },
  tseslint.configs.recommended,
]);
