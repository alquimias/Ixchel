import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckboxGroup, CheckboxItem } from './checkbox-group';

const meta = {
  component: CheckboxGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

function CheckboxDemo() {
  const [checked, setChecked] = useState(new Set([0]));
  const toggle = (index: number) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };
  return (
    <CheckboxGroup checkedIndices={checked}>
      <CheckboxItem index={0} label="Fluid hover" checked={checked.has(0)} onToggle={() => toggle(0)} />
      <CheckboxItem index={1} label="Spring motion" checked={checked.has(1)} onToggle={() => toggle(1)} />
    </CheckboxGroup>
  );
}

export const Default: Story = {
  args: { checkedIndices: new Set(), children: null },
  render: () => <CheckboxDemo />,
};
