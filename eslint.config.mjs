// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import { react } from '@erp/eslint-config';

export default [
  ...react,
  {
    ignores: [
      'src/lib/dotmatrix-core.tsx',
      'src/lib/dotmatrix-hooks.ts',
      'src/components/ui/dotm-*.tsx',
      'src/components/animate-ui/**',
      'src/hooks/use-controlled-state.tsx',
      'src/hooks/use-data-state.tsx',
      'src/lib/get-strict-context.tsx',
    ],
  },
  ...storybook.configs['flat/recommended'],
];
