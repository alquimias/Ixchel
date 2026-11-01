import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  ColorThemeProvider,
  DEFAULT_BRAND_COLORS,
  type BrandColors,
} from './color-theme';

const FOREST: BrandColors = {
  black: '#0a1610',
  lavender: '#8aa394',
  soft: '#2f6f4e',
  peri: '#7cbc98',
  ghost: '#f4faf6',
};

const COPPER: BrandColors = {
  black: '#1a100c',
  lavender: '#b5a094',
  soft: '#c45c26',
  peri: '#e8a87c',
  ghost: '#fdf6f0',
};

function PaletteSwatch({ name, colors }: { name: string; colors: BrandColors }) {
  return (
    <ColorThemeProvider scoped colors={colors}>
      <div data-testid={`palette-${name}`}>
        <Card className="w-64">
          <CardHeader>
            <CardTitle className="capitalize">{name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex gap-2">
              {Object.entries(colors).map(([key, value]) => (
                <span
                  key={key}
                  title={`${key} ${value}`}
                  className="size-6 rounded-full border border-border"
                  style={{ background: value }}
                />
              ))}
            </div>
            <Button>Primario</Button>
            <Input placeholder="Campo de marca" />
            <div className="flex gap-2">
              <Badge>Info</Badge>
              <Badge variant="secondary">Secundario</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </ColorThemeProvider>
  );
}

const meta = {
  title: 'Tema/ColorThemeProvider',
  component: ColorThemeProvider,
  tags: ['autodocs'],
  args: {
    scoped: true,
    colors: FOREST,
    children: <Button>Primario</Button>,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Los cinco tokens `--color-brand-*` son la paleta pública de Ixchel. Cambialos en CSS o con `ColorThemeProvider` y el resto del tema (primary, charts, muted, bordes) se deriva solo.',
      },
    },
  },
} satisfies Meta<typeof ColorThemeProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Paletas: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <PaletteSwatch name="byte" colors={DEFAULT_BRAND_COLORS} />
      <PaletteSwatch name="forest" colors={FOREST} />
      <PaletteSwatch name="copper" colors={COPPER} />
    </div>
  ),
  play: async ({ canvas }) => {
    const forest = canvas.getByTestId('palette-forest');
    await expect(getComputedStyle(forest).getPropertyValue('--color-brand-soft').trim()).toBe(
      '#2f6f4e',
    );
    const copper = canvas.getByTestId('palette-copper');
    await expect(getComputedStyle(copper).getPropertyValue('--color-brand-soft').trim()).toBe(
      '#c45c26',
    );
  },
};
