import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './switch';

const meta = {
  component: Switch,
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

function SwitchDemo() {
  const [checked, setChecked] = useState(true);
  return (
    <Switch label="Reduced motion follows the OS" checked={checked} onToggle={() => setChecked((value) => !value)} />
  );
}

export const Default: Story = {
  args: {
    label: 'Notifications',
    checked: true,
    onToggle: () => {},
  },
  render: () => <SwitchDemo />,
};
