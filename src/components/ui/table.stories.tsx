import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

const meta = {
  component: Table,
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow index={0}>
            <TableCell>Alice</TableCell>
            <TableCell>Engineer</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          <TableRow index={1}>
            <TableCell>Bob</TableCell>
            <TableCell>Designer</TableCell>
            <TableCell>Away</TableCell>
          </TableRow>
        </TableBody>
      </>
    ),
  },
};
