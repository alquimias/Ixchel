import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './badge';

const meta = {
  component: Badge,
  tags: ['autodocs', 'ai-generated'],
  args: {
    children: 'Borrador',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Success: Story = {
  args: { variant: 'success', children: 'Vigente' },
};

export const Warning: Story = {
  args: { variant: 'warning', children: 'Por vencer' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Vencido' },
};

export const Info: Story = {
  args: { variant: 'info', children: 'En revisión' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Opcional' },
};
