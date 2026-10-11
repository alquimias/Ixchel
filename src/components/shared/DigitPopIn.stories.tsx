import type { Meta, StoryObj } from '@storybook/react-vite';
import { DigitPopIn } from './DigitPopIn';

const meta = {
  component: DigitPopIn,
  tags: ['autodocs', 'ai-generated'],
  args: { text: '12,5', className: 'text-3xl font-semibold tabular-nums' },
} satisfies Meta<typeof DigitPopIn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Animated: Story = {};

export const Still: Story = {
  args: { animate: false },
};
