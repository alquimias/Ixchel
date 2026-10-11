import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button } from './button';
import { Dropdown, DropdownContent, DropdownMenu, DropdownTrigger } from './dropdown';
import { MenuItem } from './menu-item';

const meta = {
  component: Dropdown,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  args: { children: null },
  render: () => (
    <Dropdown className="w-56">
      <MenuItem index={0} label="General" checked />
      <MenuItem index={1} label="Historial" />
    </Dropdown>
  ),
};

export const Menu: Story = {
  args: { children: null },
  render: () => (
    <DropdownMenu>
      <DropdownTrigger render={<Button variant="secondary">Acciones</Button>} />
      <DropdownContent>
        <MenuItem index={0} label="Editar" />
        <MenuItem index={1} label="Eliminar" variant="destructive" />
      </DropdownContent>
    </DropdownMenu>
  ),
  play: async ({ canvas, userEvent, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Acciones' }));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole('menuitem', { name: 'Editar' })).toHaveAttribute(
      'aria-label',
      'Editar',
    );
  },
};
