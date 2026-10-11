import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bar, BarChart, XAxis } from 'recharts';
import { ChartContainer, type ChartConfig } from './chart';

const config = {
  incidentes: { label: 'Incidentes', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const data = [
  { mes: 'Ene', incidentes: 4 },
  { mes: 'Feb', incidentes: 2 },
  { mes: 'Mar', incidentes: 6 },
];

const meta = {
  component: ChartContainer,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BarSeries: Story = {
  args: { config, children: <BarChart data={[]} /> },
  render: () => (
    <ChartContainer config={config} className="w-full max-w-lg">
      <BarChart data={data}>
        <XAxis dataKey="mes" tickLine={false} axisLine={false} />
        <Bar dataKey="incidentes" fill="var(--color-incidentes)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
};
