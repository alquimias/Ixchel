import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsItem, TabsPanel } from './tabs';

const meta = {
  component: Tabs,
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function TabsDemo() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <div className="space-y-4">
      <Tabs selectedIndex={selectedIndex} onSelect={setSelectedIndex} idPrefix="demo">
        <TabsItem index={0} label="General" />
        <TabsItem index={1} label="Members" />
      </Tabs>
      <TabsPanel index={0} selectedIndex={selectedIndex} idPrefix="demo">
        Workspace defaults.
      </TabsPanel>
      <TabsPanel index={1} selectedIndex={selectedIndex} idPrefix="demo">
        People with access.
      </TabsPanel>
    </div>
  );
}

export const Default: Story = {
  args: {
    selectedIndex: 0,
    onSelect: () => {},
    children: null,
  },
  render: () => <TabsDemo />,
};
