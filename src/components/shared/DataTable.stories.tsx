import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable } from './DataTable';

const columns = [
  { accessorKey: 'nombre', header: 'Nombre' },
  { accessorKey: 'cargo', header: 'Cargo' },
];

const rows = [
  { nombre: 'Ana Gómez', cargo: 'Inspectora' },
  { nombre: 'Luis Pérez', cargo: 'Auxiliar' },
];

const meta = {
  component: DataTable,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Client: Story = {
  args: {
    columns,
    data: rows,
    loading: false,
    pagination: { mode: 'client' },
    searchPlaceholder: 'Buscar trabajador',
  },
};

export const Loading: Story = {
  args: {
    columns,
    data: [],
    loading: true,
    pagination: { mode: 'client' },
  },
};
