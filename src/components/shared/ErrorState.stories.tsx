import type { Meta, StoryObj } from '@storybook/react-vite';
import { ErrorState } from './ErrorState';

const meta = {
  component: ErrorState,
  tags: ['autodocs', 'ai-generated'],
  args: { message: 'No se pudo cargar el listado. Inténtalo de nuevo.' },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
