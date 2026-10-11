import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputField, InputGroup } from './input-group';

const meta = {
  component: InputGroup,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

function Fields({ error }: { error?: string }) {
  const [nombre, setNombre] = useState('Ana Gómez');
  const [correo, setCorreo] = useState('');
  return (
    <InputGroup className="max-w-sm">
      <InputField label="Nombre" value={nombre} onChange={setNombre} />
      <InputField label="Correo" type="email" value={correo} onChange={setCorreo} error={error} />
    </InputGroup>
  );
}

export const Default: Story = {
  args: { children: null },
  render: () => <Fields />,
};

export const WithError: Story = {
  args: { children: null },
  render: () => <Fields error="Ingresa un correo válido" />,
};
