import type { Meta, StoryObj } from '@storybook/react-vite';
import { DotmSquare5 } from './dotm-square-5';

const meta = {
  component: DotmSquare5,
  tags: ['autodocs', 'ai-generated'],
  args: { size: 88, ariaLabel: 'Cargando' },
} satisfies Meta<typeof DotmSquare5>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Animated: Story = {};

export const Still: Story = {
  args: { animated: false },
};
