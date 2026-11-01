import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrollArea } from './scroll-area';

const meta = {
  component: ScrollArea,
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'h-40 w-64',
    children: (
      <div className="space-y-2 p-2">
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index}>Row {index + 1}</p>
        ))}
      </div>
    ),
  },
};
