import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { TabItem, TabPanel, Tabs, TabsList } from './tabs';

const meta = {
  component: Tabs,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function TabsExample() {
  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabItem value="general" label="General" />
        <TabItem value="historial" label="Historial" />
      </TabsList>
      <TabPanel value="general">Datos de la sede</TabPanel>
      <TabPanel value="historial">Sin registros anteriores</TabPanel>
    </Tabs>
  );
}

export const Default: Story = {
  render: () => <TabsExample />,
};

export const SwitchTab: Story = {
  render: () => <TabsExample />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('tab', { name: 'Historial' }));
    await expect(canvas.getByRole('tab', { name: 'Historial' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByText('Sin registros anteriores')).toBeVisible();
  },
};
