import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './badge';

const meta = {
  component: Badge,
  tags: ['autodocs'],
  args: {
    children: 'New',
    color: 'accent',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = {};

export const Dot: Story = {
  args: { variant: 'dot', color: 'green', children: 'Active' },
};
