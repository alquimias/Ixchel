import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputField, InputGroup } from './input-group';

const meta = {
  component: InputGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

function InputGroupDemo() {
  const [name, setName] = useState('Ixchel');
  const [email, setEmail] = useState('you@example.com');
  return (
    <InputGroup>
      <InputField index={0} label="Name" value={name} onChange={setName} />
      <InputField index={1} label="Email" value={email} onChange={setEmail} />
    </InputGroup>
  );
}

export const Default: Story = {
  args: { children: null },
  render: () => <InputGroupDemo />,
};
