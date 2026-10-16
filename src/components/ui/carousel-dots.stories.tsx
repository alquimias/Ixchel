import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { CarouselDots, type CarouselDotsProps } from './carousel-dots';

const meta = {
  component: CarouselDots,
  tags: ['autodocs', 'ai-generated'],
  args: {
    count: 3,
    value: 0,
  },
} satisfies Meta<typeof CarouselDots>;

export default meta;
type Story = StoryObj<typeof meta>;

function DotsPlayground({
  value: initialValue,
  ...props
}: CarouselDotsProps) {
  const [value, setValue] = useState(initialValue);
  return (
    <CarouselDots
      {...props}
      value={value}
      onValueChange={setValue}
      getLabel={(index) => `Ir al paso ${index + 1}`}
      aria-label="Pasos"
    />
  );
}

export const Default: Story = {
  render: (args) => <DotsPlayground {...args} />,
  play: async ({ canvas, userEvent }) => {
    const second = canvas.getByRole('button', { name: 'Ir al paso 2' });
    await userEvent.click(second);
    await expect(second).toHaveAttribute('aria-current', 'true');
  },
};

export const Autoplay: Story = {
  args: { autoplay: { duration: 3000 } },
  render: (args) => <DotsPlayground {...args} />,
};
