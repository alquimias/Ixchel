import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CarouselDots } from './carousel-dots';

const meta = {
  component: CarouselDots,
  tags: ['autodocs'],
} satisfies Meta<typeof CarouselDots>;

export default meta;
type Story = StoryObj<typeof meta>;

function DotsDemo() {
  const [value, setValue] = useState(1);
  return <CarouselDots count={4} value={value} onValueChange={setValue} />;
}

export const Default: Story = {
  args: { count: 4, value: 0 },
  render: () => <DotsDemo />,
};
