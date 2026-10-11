import { useEffect, type ReactNode } from 'react';
import type { Preview } from '@storybook/react-vite';
import { ShapeProvider, type ShapeVariant } from '../src/lib/shape-context';
import '../src/styles/storybook.css';

function resolveShape(value: unknown): ShapeVariant {
  return value === 'rounded' ? 'rounded' : 'pill';
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
  },
  decorators: [
    (Story, context) => {
      const shape = resolveShape(context.globals.shape);
      return (
        <ShapeProvider key={shape} defaultShape={shape}>
          <ThemeFrame theme={String(context.globals.theme ?? 'light')}>
            <Story />
          </ThemeFrame>
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
