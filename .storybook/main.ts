import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/react-vite',
  features: {
    componentsManifest: true,
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [tailwindcss()],
      optimizeDeps: {
        include: [
          '@base-ui/react/dialog',
          '@base-ui/react/field',
          '@base-ui/react/menu',
          '@base-ui/react/scroll-area',
          '@base-ui/react/select',
          '@base-ui/react/tooltip',
          'border-beam',
          'react-hook-form',
          'recharts',
        ],
      },
    });
  },
};

export default config;
