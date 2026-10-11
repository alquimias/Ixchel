import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, AlertDescription, AlertTitle } from './alert';

const meta = {
  component: Alert,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Capacitación programada</AlertTitle>
      <AlertDescription>La sesión de inducción queda para el viernes a las 8:00.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTitle>No se pudo guardar</AlertTitle>
      <AlertDescription>Revisa la conexión e inténtalo de nuevo.</AlertDescription>
    </Alert>
  ),
};
