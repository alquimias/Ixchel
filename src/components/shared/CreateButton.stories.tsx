import type { Meta, StoryObj } from '@storybook/react-vite';
import { CreateButton } from './CreateButton';

const meta = {
  component: CreateButton,
  tags: ['autodocs', 'ai-generated'],
  args: { children: 'Nuevo trabajador' },
} satisfies Meta<typeof CreateButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
