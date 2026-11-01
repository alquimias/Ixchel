import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

const meta = {
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Surfaces</CardTitle>
          <CardDescription>Eight elevation levels in light and dark.</CardDescription>
        </CardHeader>
        <CardContent>Cards inherit the substrate underneath them.</CardContent>
      </>
    ),
  },
};
