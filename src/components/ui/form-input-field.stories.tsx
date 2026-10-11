import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm } from 'react-hook-form';
import { FormInputField } from './form-input-field';

const meta = {
  component: FormInputField,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof FormInputField>;

export default meta;
type Story = StoryObj<typeof meta>;

function NombreField({ error }: { error?: string }) {
  const { control, setError } = useForm({ defaultValues: { nombre: error ? '' : 'Ana Gómez' } });
  useEffect(() => {
    if (error) setError('nombre', { message: error });
  }, [error, setError]);
  return <FormInputField control={control} name="nombre" label="Nombre" />;
}

export const Default: Story = {
  args: { label: 'Nombre', name: 'nombre', control: undefined as never },
  render: () => <NombreField />,
};

export const WithError: Story = {
  args: { label: 'Nombre', name: 'nombre', control: undefined as never },
  render: () => <NombreField error="El nombre es obligatorio" />,
};
