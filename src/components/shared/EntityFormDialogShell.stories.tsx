import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { EntityFormDialogShell } from './EntityFormDialogShell';

const meta = {
  component: EntityFormDialogShell,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof EntityFormDialogShell>;

export default meta;
type Story = StoryObj<typeof meta>;

function CargoDialog({
  initialOpen = false,
  saving = false,
}: {
  initialOpen?: boolean;
  saving?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Nuevo cargo
      </Button>
      <EntityFormDialogShell
        open={open}
        onOpenChange={setOpen}
        title="Nuevo cargo"
        submitLabel="Crear cargo"
        isSaving={saving}
        onSubmit={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
      >
        <Input aria-label="Nombre del cargo" placeholder="Inspectora" />
      </EntityFormDialogShell>
    </>
  );
}

export const Default: Story = {
  args: {
    open: false,
    onOpenChange: () => undefined,
    title: 'Nuevo cargo',
    submitLabel: 'Crear cargo',
    isSaving: false,
    onSubmit: () => undefined,
    children: null,
  },
  render: () => <CargoDialog />,
};

export const Saving: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Nuevo cargo',
    submitLabel: 'Crear cargo',
    isSaving: true,
    onSubmit: () => undefined,
    children: null,
  },
  render: () => <CargoDialog initialOpen saving />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole('button', { name: 'Guardando…' })).toBeDisabled();
  },
};
