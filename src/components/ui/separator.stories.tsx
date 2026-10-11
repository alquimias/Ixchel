import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from './separator';

const meta = {
  component: Separator,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="max-w-sm">
      <p className="text-sm">Datos generales</p>
      <Separator className="my-3" />
      <p className="text-sm">Contacto</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-6 items-center gap-3 text-sm">
      <span>Sedes</span>
      <Separator orientation="vertical" />
      <span>12</span>
    </div>
  ),
};
