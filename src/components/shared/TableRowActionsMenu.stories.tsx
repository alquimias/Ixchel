import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Pencil, Trash2 } from 'lucide-react';
import { TableRowActionsMenu } from './TableRowActionsMenu';

const meta = {
  component: TableRowActionsMenu,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof TableRowActionsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { id: 'edit', label: 'Editar', icon: Pencil, onSelect: () => undefined },
      {
        id: 'delete',
        label: 'Eliminar',
        icon: Trash2,
        destructive: true,
        separatorBefore: true,
        onSelect: () => undefined,
      },
    ],
  },
  play: async ({ canvas, userEvent, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Acciones' }));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole('menuitem', { name: 'Editar' })).toHaveAttribute(
      'aria-label',
      'Editar',
    );
  },
};
