import type { Meta, StoryObj } from '@storybook/react-vite';
import { CreateButton } from './CreateButton';
import { PageHeader } from './PageHeader';

const meta = {
  component: PageHeader,
  tags: ['autodocs', 'ai-generated'],
  args: {
    title: 'Trabajadores',
    description: 'Personas vinculadas a la empresa activa.',
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: { actions: <CreateButton>Nuevo trabajador</CreateButton> },
};
