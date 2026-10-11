import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormSection, FormShell, FormShellSkeleton } from './FormShell';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const meta = {
  component: FormShell,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof FormShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <FormShell className="max-w-lg" onSubmit={(event) => event.preventDefault()}>
      <FormSection title="Identificación" description="Datos básicos del trabajador.">
        <div className="grid gap-2">
          <Label htmlFor="nombre-form">Nombre</Label>
          <Input id="nombre-form" defaultValue="Ana Gómez" />
        </div>
      </FormSection>
    </FormShell>
  ),
};

export const Loading: Story = {
  render: () => <FormShellSkeleton rows={4} />,
};
