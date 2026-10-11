import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { EmptyState } from './EmptyState';

const meta = {
  component: EmptyState,
  tags: ['autodocs', 'ai-generated'],
  args: {
    title: 'Sin trabajadores',
    description: 'Agrega el primero para empezar el listado.',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Table: Story = {};

export const Search: Story = {
  args: {
    variant: 'search',
    title: 'Sin resultados',
    description: 'Prueba con otro nombre o documento.',
  },
};

export const WithAction: Story = {
  args: {
    action: { label: 'Nuevo trabajador', onClick: () => undefined },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Sin trabajadores' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Nuevo trabajador' })).toBeEnabled();
  },
};
