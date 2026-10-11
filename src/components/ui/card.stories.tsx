import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';

const meta = {
  component: Card,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Sede principal</CardTitle>
        <CardDescription>Bogotá</CardDescription>
      </CardHeader>
      <CardContent>12 trabajadores activos</CardContent>
      <CardFooter>
        <Button variant="tertiary">Ver sede</Button>
      </CardFooter>
    </Card>
  ),
};

export const Compact: Story = {
  render: () => (
    <Card size="sm" className="max-w-sm">
      <CardHeader>
        <CardTitle>Incidentes abiertos</CardTitle>
      </CardHeader>
      <CardContent>3</CardContent>
    </Card>
  ),
};
