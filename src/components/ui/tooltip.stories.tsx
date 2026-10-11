import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import { Tooltip } from './tooltip';

const meta = {
  component: Tooltip,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { content: 'Guardar cambios', children: <Button>Guardar</Button> },
  render: () => (
    <Tooltip content="Guardar cambios">
      <Button>Guardar</Button>
    </Tooltip>
  ),
};
