import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './slider';

const meta = {
  component: Slider,
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

function SliderDemo() {
  const [value, setValue] = useState<number>(40);
  return <Slider value={value} onChange={(next) => setValue(next as number)} />;
}

export const Default: Story = {
  args: { value: 40, onChange: () => {} },
  render: () => <SliderDemo />,
};
