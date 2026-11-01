import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';

const meta = {
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Save',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Cancel' },
};

export const Tertiary: Story = {
  args: { variant: 'tertiary', children: 'Filter' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Skip' },
};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
