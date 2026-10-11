import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './input';
import { Label } from './label';

const meta = {
  component: Label,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Field: Story = {
  render: () => (
    <div className="grid max-w-sm gap-2">
      <Label htmlFor="documento">Documento</Label>
      <Input id="documento" defaultValue="1234567890" />
    </div>
  ),
};

export const Inline: Story = {
  args: { children: 'Recordarme', variant: 'inline', htmlFor: 'recordar' },
};
