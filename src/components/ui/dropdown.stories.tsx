import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import { DropdownContent, DropdownMenu, DropdownTrigger } from './dropdown';
import { MenuItem } from './menu-item';

const meta = {
  component: DropdownMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <DropdownTrigger render={<Button variant="secondary">Open menu</Button>} />
        <DropdownContent>
          <MenuItem index={0} label="Duplicate" />
          <MenuItem index={1} label="Archive" />
        </DropdownContent>
      </>
    ),
  },
};
