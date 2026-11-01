import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select, SelectContent, SelectItem, SelectTrigger } from './select';

const meta = {
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 'inter',
    children: (
      <>
        <SelectTrigger />
        <SelectContent>
          <SelectItem index={0} value="inter">
            Inter
          </SelectItem>
          <SelectItem index={1} value="system">
            System
          </SelectItem>
        </SelectContent>
      </>
    ),
  },
};
