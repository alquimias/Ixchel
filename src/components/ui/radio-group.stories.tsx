import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioGroup, RadioItem } from './radio-group';

const meta = {
  component: RadioGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

function RadioDemo() {
  const [value, setValue] = useState('rounded');
  return (
    <RadioGroup value={value} onValueChange={setValue}>
      <RadioItem index={0} value="rounded" label="Rounded" />
      <RadioItem index={1} value="pill" label="Pill" />
    </RadioGroup>
  );
}

export const Default: Story = {
  args: { children: null },
  render: () => <RadioDemo />,
};
