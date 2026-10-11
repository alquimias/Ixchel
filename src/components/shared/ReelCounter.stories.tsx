import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReelCounter } from './ReelCounter';

const meta = {
  component: ReelCounter,
  tags: ['autodocs', 'ai-generated'],
  args: { text: '128', className: 'text-3xl font-semibold' },
} satisfies Meta<typeof ReelCounter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Animated: Story = {};

export const Still: Story = {
  args: { animate: false },
};
