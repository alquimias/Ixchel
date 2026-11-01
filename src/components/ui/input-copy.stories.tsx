import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputCopy } from './input-copy';

const meta = {
  component: InputCopy,
  tags: ['autodocs'],
  args: {
    value: 'npx shadcn@latest add @fluid/button',
    label: 'Install',
  },
} satisfies Meta<typeof InputCopy>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
