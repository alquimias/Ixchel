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
      'src/lib/dotmatrix-core.tsx',
      'src/lib/dotmatrix-hooks.ts',
      'src/components/ui/dotm-*.tsx',
      'src/components/animate-ui/**',
      'src/hooks/use-controlled-state.tsx',
      'src/hooks/use-data-state.tsx',
      'src/hooks/use-fluid-hover.ts',
      'src/components/ui/carousel-dots.tsx',
      'src/components/ui/fluid-hover-highlight.tsx',
      'src/lib/get-strict-context.tsx',
    ],
  },
  ...storybook.configs['flat/recommended'],
);
