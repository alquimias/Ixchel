import type { Meta, StoryObj } from '@storybook/react-vite';
import { Activity } from 'lucide-react';
import { StatCard } from './StatCard';

const meta = {
  component: StatCard,
  tags: ['autodocs', 'ai-generated'],
  args: {
    label: 'Índice de frecuencia',
    value: '2,4',
    description: 'Últimos 12 meses',
    animateValue: false,
    className: 'max-w-xs',
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    icon: <Activity className="size-4" />,
  },
};
