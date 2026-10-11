import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

const meta = {
  component: Table,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Cargo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ana Gómez</TableCell>
          <TableCell>Inspectora</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Luis Pérez</TableCell>
          <TableCell>Auxiliar</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
