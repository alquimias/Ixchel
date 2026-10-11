import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button } from '../ui/button';
import { ConfirmDialog } from './ConfirmDialog';

const meta = {
  component: ConfirmDialog,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function ConfirmExample({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Eliminar
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Eliminar trabajador"
        description="Esta acción no se puede deshacer."
        onConfirm={() => setOpen(false)}
      />
    </>
  );
}

export const Default: Story = {
  args: {
    open: false,
    onOpenChange: () => undefined,
    title: 'Eliminar trabajador',
    description: 'Esta acción no se puede deshacer.',
    onConfirm: () => undefined,
  },
  render: () => <ConfirmExample />,
};

export const Open: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Eliminar trabajador',
    description: 'Esta acción no se puede deshacer.',
    onConfirm: () => undefined,
  },
  render: () => <ConfirmExample initialOpen />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: 'Eliminar trabajador' });
    await expect(dialog).toHaveAttribute('data-state', 'open');
  },
};
