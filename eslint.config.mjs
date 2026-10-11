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
];
