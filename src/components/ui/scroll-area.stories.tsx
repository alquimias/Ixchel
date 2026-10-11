import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrollArea } from './scroll-area';

const meta = {
  component: ScrollArea,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  render: () => (
    <ScrollArea className="h-40 w-64 rounded-lg border border-border">
      <div className="grid gap-2 p-3">
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index} className="text-sm">
            Hallazgo {index + 1}
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
};
