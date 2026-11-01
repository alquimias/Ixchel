import { useEffect, type ReactNode } from 'react';
import type { Preview } from '@storybook/react-vite';
import { ColorThemeProvider, type BrandColors } from '../src/lib/color-theme';
import { ShapeProvider, type ShapeVariant } from '../src/lib/shape-context';
import '../src/styles/storybook.css';

function resolveShape(value: unknown): ShapeVariant {
  return value === 'rounded' ? 'rounded' : 'pill';
}

const STORYBOOK_PALETTES: Record<string, Partial<BrandColors>> = {
  forest: {
    black: '#0a1610',
    lavender: '#8aa394',
    soft: '#2f6f4e',
    peri: '#7cbc98',
    ghost: '#f4faf6',
  },
  copper: {
    black: '#1a100c',
    lavender: '#b5a094',
    soft: '#c45c26',
    peri: '#e8a87c',
    ghost: '#fdf6f0',
  },
  ocean: {
    black: '#061018',
    lavender: '#8aa4b5',
    soft: '#1d6f9a',
    peri: '#7eb6d4',
    ghost: '#f3f8fb',
  },
};

function resolvePalette(value: unknown): Partial<BrandColors> | undefined {
  if (typeof value !== 'string') return undefined;
  return STORYBOOK_PALETTES[value];
}

function ThemeFrame({ theme, children }: { theme: string; children: ReactNode }) {
  const dark = theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [dark]);

  return (
    <div className={dark ? 'dark' : undefined}>
      <div className="min-h-40 bg-background p-6 text-foreground">{children}</div>
    </div>
  );
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Tema claro u oscuro',
      defaultValue: 'light',
      toolbar: {
        title: 'Tema',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Claro' },
          { value: 'dark', title: 'Oscuro' },
        ],
        dynamicTitle: true,
      },
    },
    shape: {
      description: 'Radio del sistema de diseño',
      defaultValue: 'pill',
      toolbar: {
        title: 'Forma',
        icon: 'box',
        items: [
          { value: 'pill', title: 'Pill' },
          { value: 'rounded', title: 'Rounded' },
        ],
        dynamicTitle: true,
      },
    },
    palette: {
      description: 'Paleta de marca (--color-brand-*)',
      defaultValue: 'byte',
      toolbar: {
        title: 'Paleta',
        icon: 'paintbrush',
        items: [
          { value: 'byte', title: 'BYTE' },
          { value: 'forest', title: 'Forest' },
          { value: 'copper', title: 'Copper' },
          { value: 'ocean', title: 'Ocean' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const shape = resolveShape(context.globals.shape);
      const palette = resolvePalette(context.globals.palette);
      return (
        <ShapeProvider key={shape} defaultShape={shape}>
          <ColorThemeProvider colors={palette}>
            <ThemeFrame theme={String(context.globals.theme ?? 'light')}>
              <Story />
            </ThemeFrame>
          </ColorThemeProvider>
        </ShapeProvider>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
