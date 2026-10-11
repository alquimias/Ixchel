import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardBeamShell } from './CardBeamShell';

const meta = {
  component: CardBeamShell,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof CardBeamShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null as ReactNode },
  render: () => (
    <CardBeamShell className="max-w-sm p-4">
      <p className="text-sm font-medium">Inspección programada</p>
      <p className="text-sm text-muted-foreground">Sede norte · viernes 8:00</p>
    </CardBeamShell>
  ),
};
