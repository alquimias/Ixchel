import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThinkingIndicator } from './thinking-indicator';

const meta = {
  component: ThinkingIndicator,
  tags: ['autodocs'],
} satisfies Meta<typeof ThinkingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
