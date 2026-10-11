import type { Meta, StoryObj } from '@storybook/react-vite';
import { StaggerReveal } from './StaggerReveal';

const meta = {
  component: StaggerReveal,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof StaggerReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shown: Story = {
  args: { children: null },
  render: () => (
    <StaggerReveal show className="grid gap-1">
      <StaggerReveal.Line as="p" line={1} className="text-sm">
        Primera línea del encabezado
      </StaggerReveal.Line>
      <StaggerReveal.Line as="p" line={2} className="text-sm text-muted-foreground">
        Segunda línea, con un pequeño retraso
      </StaggerReveal.Line>
    </StaggerReveal>
  ),
};
