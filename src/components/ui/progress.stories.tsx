import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from './progress';

const meta = {
  component: Progress,
  tags: ['autodocs', 'ai-generated'],
  args: { value: 40, className: 'max-w-sm' },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const ByValue: Story = {
  render: () => (
    <div className="grid max-w-sm gap-3">
      <Progress value={30} colorByValue />
      <Progress value={65} colorByValue />
      <Progress value={90} colorByValue />
    </div>
  ),
};
