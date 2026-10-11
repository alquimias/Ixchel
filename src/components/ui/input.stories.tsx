import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Input } from './input';

const meta = {
  component: Input,
  tags: ['autodocs', 'ai-generated'],
  args: {
    'aria-label': 'Correo',
    placeholder: 'nombre@empresa.com',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'ana@empresa.com' },
};

export const Invalid: Story = {
  args: {
    'aria-invalid': true,
    defaultValue: 'no-es-correo',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Correo' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  },
};
