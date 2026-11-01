import js from '@eslint/js';
import configPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  tseslint.configs.recommended,
  configPrettier,
  reactHooks.configs.flat.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    ignores: [
      'src/fluid.lock.json',
      'src/components/ui/*.tsx',
      '!src/components/ui/*.stories.tsx',
      '!src/components/ui/*.test.tsx',
      'src/components/ui/*.ts',
      'src/components/sidebar-app/**',
      '!src/components/sidebar-app/**/*.stories.tsx',
      'src/components/dialog-sidebar/**',
      '!src/components/dialog-sidebar/**/*.stories.tsx',
      'src/components/queued-stack.tsx',
      'src/lib/**/*.ts',
      'src/lib/**/*.tsx',
      '!src/lib/**/*.test.tsx',
      'src/hooks/**',
      '!src/hooks/**/*.test.ts',
      '!src/hooks/**/*.test.tsx',
    ],
  },
  ...storybook.configs['flat/recommended'],
);
