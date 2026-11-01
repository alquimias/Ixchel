import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../ui/button';
import { SettingsDialog } from './settings-dialog';

const meta = {
  component: SettingsDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof SettingsDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultOpen: true,
  },
  render: (args) => (
    <>
      <Button variant="secondary">Settings live in the dialog</Button>
      <SettingsDialog {...args} />
    </>
  ),
};
