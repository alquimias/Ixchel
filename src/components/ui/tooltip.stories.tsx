import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import { Tooltip } from './tooltip';

const meta = {
  component: Tooltip,
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'Copy to clipboard',
    children: <Button variant="secondary">Hover me</Button>,
  },
};
