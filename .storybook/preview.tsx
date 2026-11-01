import { useEffect, type ReactNode } from 'react';
import type { Preview } from '@storybook/react-vite';
import { FluidProvider } from '../src/lib/fluid-provider';
import { TooltipProvider } from '../src/components/ui/tooltip';
import type { ShapeVariant } from '../src/lib/shape-context';
import type { SizeVariant } from '../src/lib/size-context';
import '../src/styles/storybook.css';

function resolveShape(value: unknown): ShapeVariant {
  return value === 'pill' ? 'pill' : 'rounded';
}

function resolveSize(value: unknown): SizeVariant {
  return value === 'compact' ? 'compact' : 'default';
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
      description: 'Radio del sistema',
      defaultValue: 'rounded',
      toolbar: {
        title: 'Forma',
        icon: 'box',
        items: [
          { value: 'rounded', title: 'Rounded' },
          { value: 'pill', title: 'Pill' },
        ],
        dynamicTitle: true,
      },
    },
    size: {
      description: 'Escala de tamaño',
      defaultValue: 'default',
      toolbar: {
        title: 'Tamaño',
        icon: 'expand',
        items: [
          { value: 'default', title: 'Default' },
          { value: 'compact', title: 'Compact' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const shape = resolveShape(context.globals.shape);
      const size = resolveSize(context.globals.size);
      return (
        <FluidProvider key={`${shape}-${size}`} shape={shape} size={size}>
          <TooltipProvider>
            <ThemeFrame theme={String(context.globals.theme ?? 'light')}>
              <Story />
            </ThemeFrame>
          </TooltipProvider>
        </FluidProvider>
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
