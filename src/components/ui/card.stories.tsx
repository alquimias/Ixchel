import type { Meta, StoryObj } from '@storybook/react-vite';
import { Building2, Circle, Shield } from 'lucide-react';
import {
  Card,
  CardButton,
  CardContent,
  CardDescription,
  CardFooter,
  CardGroup,
  CardHeader,
  CardMedia,
  CardTitle,
} from './card';

const meta = {
  component: Card,
  tags: ['autodocs'],
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
        <CardButton>Ver sede</CardButton>
      </CardFooter>
    </Card>
  ),
};

export const Compact: Story = {
  render: () => (
    <Card size="compact" className="max-w-sm">
      <CardHeader>
        <CardTitle>Incidentes abiertos</CardTitle>
      </CardHeader>
      <CardContent>3</CardContent>
    </Card>
  ),
};

export const Group: Story = {
  render: () => (
    <CardGroup columns={2} className="max-w-xl">
      <Card href="#matriz" label="Matriz de peligros">
        <CardMedia icon={Shield} />
        <CardHeader>
          <CardTitle>Matriz de peligros</CardTitle>
          <CardDescription>Identifica y valora los riesgos de cada sede</CardDescription>
        </CardHeader>
        <CardFooter>
          <CardButton>Abrir</CardButton>
        </CardFooter>
      </Card>
      <Card href="#inspecciones" label="Inspecciones">
        <CardMedia icon={Building2} />
        <CardHeader>
          <CardTitle>Inspecciones</CardTitle>
          <CardDescription>Programa y registra hallazgos por planta</CardDescription>
        </CardHeader>
        <CardFooter>
          <CardButton>Abrir</CardButton>
        </CardFooter>
      </Card>
    </CardGroup>
  ),
};

export const Inline: Story = {
  render: () => (
    <CardGroup orientation="inline" className="max-w-lg">
      <Card href="#epp" label="Entrega de EPP">
        <CardMedia icon={Circle} />
        <CardHeader>
          <CardTitle>Entrega de EPP</CardTitle>
          <CardDescription>Firma pendiente</CardDescription>
        </CardHeader>
        <CardFooter>
          <CardButton>Revisar</CardButton>
        </CardFooter>
      </Card>
      <Card href="#examenes" selected label="Exámenes médicos">
        <CardMedia icon={Circle} />
        <CardHeader>
          <CardTitle>Exámenes médicos</CardTitle>
          <CardDescription>Vencen este mes</CardDescription>
        </CardHeader>
        <CardFooter>
          <CardButton>Revisar</CardButton>
        </CardFooter>
      </Card>
    </CardGroup>
  ),
};
