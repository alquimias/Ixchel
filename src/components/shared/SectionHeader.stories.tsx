import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionHeader } from './SectionHeader';

const meta = {
  component: SectionHeader,
  tags: ['autodocs', 'ai-generated'],
  args: {
    title: 'Hallazgos abiertos',
    description: 'Requieren acción antes del cierre del periodo.',
    animateReveal: false,
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Accent: Story = {};

export const Plain: Story = {
  args: { variant: 'plain' },
};
