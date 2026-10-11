import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dropdown } from './dropdown';
import { MenuItem } from './menu-item';

const meta = {
  component: MenuItem,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof MenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { index: 0, label: 'Editar' },
  render: () => (
    <Dropdown className="w-64">
      <MenuItem index={0} label="Editar" description="Actualiza los datos" />
      <MenuItem index={1} label="Eliminar" variant="destructive" />
    </Dropdown>
  ),
};
