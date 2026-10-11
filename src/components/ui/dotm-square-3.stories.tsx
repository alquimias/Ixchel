import type { Meta, StoryObj } from '@storybook/react-vite';
import { DotmSquare3 } from './dotm-square-3';

const meta = {
  component: DotmSquare3,
  tags: ['autodocs', 'ai-generated'],
  args: { size: 72, ariaLabel: 'Cargando' },
} satisfies Meta<typeof DotmSquare3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Animated: Story = {};

export const Still: Story = {
  args: { animated: false },
};
