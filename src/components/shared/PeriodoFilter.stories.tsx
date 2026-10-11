import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PeriodoFilter } from './PeriodoFilter';

const meta = {
  component: PeriodoFilter,
  tags: ['autodocs', 'ai-generated'],
} satisfies Meta<typeof PeriodoFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

function PeriodoExample() {
  const [desde, setDesde] = useState('2026-01-01');
  const [hasta, setHasta] = useState('2026-03-31');
  return (
    <PeriodoFilter
      fechaDesde={desde}
      fechaHasta={hasta}
      onFechaDesdeChange={setDesde}
      onFechaHastaChange={setHasta}
      onClear={() => {
        setDesde('');
        setHasta('');
      }}
    />
  );
}

export const Default: Story = {
  args: {
    fechaDesde: '2026-01-01',
    fechaHasta: '2026-03-31',
    onFechaDesdeChange: () => undefined,
    onFechaHastaChange: () => undefined,
    onClear: () => undefined,
  },
  render: () => <PeriodoExample />,
};
