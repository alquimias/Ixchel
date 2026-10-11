import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const meta = {
  component: Select,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

function EstadoSelect() {
  const [value, setValue] = useState('abierto');
  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger aria-label="Estado" placeholder="Estado" className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="abierto">Abierto</SelectItem>
        <SelectItem value="cerrado">Cerrado</SelectItem>
      </SelectContent>
    </Select>
  );
}

export const Default: Story = {
  args: { children: null },
  render: () => <EstadoSelect />,
};

export const ChooseOption: Story = {
  args: { children: null },
  render: () => <EstadoSelect />,
  play: async ({ canvas, userEvent, canvasElement }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Estado' }));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole('option', { name: 'Cerrado' }));
    await expect(canvas.getByRole('combobox', { name: 'Estado' })).toHaveTextContent('Cerrado');
  },
};
