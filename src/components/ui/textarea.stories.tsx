import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Textarea } from './textarea';

const meta = {
  component: Textarea,
  tags: ['autodocs', 'ai-generated'],
  args: {
    'aria-label': 'Descripción',
    placeholder: 'Describe el hallazgo',
    className: 'max-w-sm',
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'Texto demasiado corto' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Descripción' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  },
};
