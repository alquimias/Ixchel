import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Checkbox } from './checkbox';

const meta = {
  component: Checkbox,
  tags: ['autodocs', 'ai-generated'],
  args: {
    id: 'activo',
    label: 'Activo',
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox', { name: 'Activo' })).toBeChecked();
  },
};

export const Toggle: Story = {
  args: { id: 'notificaciones', label: 'Notificaciones' },
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole('checkbox', { name: 'Notificaciones' });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
  },
};
