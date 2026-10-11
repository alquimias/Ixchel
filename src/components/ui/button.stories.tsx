import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Button } from './button';

const meta = {
  component: Button,
  tags: ['autodocs', 'ai-generated'],
  args: {
    children: 'Guardar',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Cancelar' },
};

export const Tertiary: Story = {
  args: { variant: 'tertiary', children: 'Filtrar' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Omitir' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Eliminar' },
};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  },
};

export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Guardar' });
    const fill = button.querySelector('[aria-hidden]');
    await expect(fill).not.toBeNull();
    // El fondo primary resuelve --foreground → --color-brand-black (#000807).
    await expect(getComputedStyle(fill as Element).backgroundColor).toBe('rgb(0, 8, 7)');
  },
};
