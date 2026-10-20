import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';
import { PageHeader } from '../PageHeader';
import { StatCard } from '../StatCard';

describe('EmptyState', () => {
  it('renderiza el titulo y la descripcion, y el CTA cuando action no es null', () => {
    render(
      <EmptyState
        title="No hay trabajadores registrados"
        description="Registra el primer trabajador de tu empresa."
        action={{ label: 'Nuevo Trabajador', to: '/rrhh/trabajadores/nuevo', create: true }}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'No hay trabajadores registrados' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Registra el primer trabajador de tu empresa.')).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Nuevo Trabajador' });
    expect(cta).toHaveAttribute('href', '/rrhh/trabajadores/nuevo');
  });

  it('no renderiza CTA cuando action es null', () => {
    render(
      <EmptyState
        title="No hay trabajadores inactivos"
        description="Los trabajadores dados de baja aparecerán aquí."
        action={null}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'No hay trabajadores inactivos' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('renderiza el message dentro de un alert y aplica className', () => {
    render(<ErrorState message="Ocurrió un error inesperado" className="custom-class" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-class');
    expect(screen.getByText('Ocurrió un error inesperado')).toBeInTheDocument();
  });
});

describe('PageHeader', () => {
  it('renderiza title en un h1 y muestra el nodo actions', () => {
    render(
      <PageHeader title="Trabajadores" actions={<button type="button">Nuevo Trabajador</button>} />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Trabajadores' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nuevo Trabajador' })).toBeInTheDocument();
  });

  it('renderiza la descripcion cuando se proporciona', () => {
    render(
      <PageHeader
        title="Trabajadores"
        description="Consulta y administra la nómina de tu empresa."
      />,
    );

    expect(screen.getByText('Consulta y administra la nómina de tu empresa.')).toBeInTheDocument();
  });

  it('alinea las acciones del encabezado por la base', () => {
    const { container } = render(
      <PageHeader title="Plan de trabajo" actions={<button type="button">Crear</button>} />,
    );

    expect(container.querySelector('.items-center')).toBeTruthy();
    expect(container.querySelector('.h-9')).toBeTruthy();
  });
});

describe('StatCard', () => {
  it('renderiza label y value con solo las props requeridas', () => {
    render(<StatCard label="IF anual" value="12,34" animateValue={false} />);

    expect(document.querySelector('[data-slot="card-title"]')).toHaveTextContent('IF anual');
    expect(screen.getByText('12,34')).toBeInTheDocument();
  });

  it('renderiza description cuando se provee y la omite cuando no', () => {
    const { rerender } = render(
      <StatCard label="Trabajadores" value="100" description="Base anual usada para el cálculo." />,
    );

    expect(screen.getByText('Base anual usada para el cálculo.')).toBeInTheDocument();

    rerender(<StatCard label="Trabajadores" value="100" />);

    expect(screen.queryByText('Base anual usada para el cálculo.')).not.toBeInTheDocument();
  });

  it('renderiza el nodo icon cuando se provee y lo omite cuando no', () => {
    const { rerender } = render(
      <StatCard label="KPI" value="1" icon={<span data-testid="stat-icon">icono</span>} />,
    );

    expect(screen.getByTestId('stat-icon')).toBeInTheDocument();

    rerender(<StatCard label="KPI" value="1" />);

    expect(screen.queryByTestId('stat-icon')).not.toBeInTheDocument();
  });

  it('renderiza el nodo trend cuando se provee', () => {
    render(<StatCard label="KPI" value="1" trend={<span data-testid="stat-trend">+5%</span>} />);

    expect(screen.getByTestId('stat-trend')).toBeInTheDocument();
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });

  it('aplica className del llamador al elemento raíz de la tarjeta', () => {
    const { container } = render(
      <StatCard label="KPI" value="1" className="mi-stat-card" animateValue={false} />,
    );

    const cardRoot = container.querySelector('[data-slot="card"]');
    expect(cardRoot).toHaveClass('mi-stat-card');
  });

  it('anima el value por defecto cuando el dato es numérico', () => {
    const { container } = render(<StatCard label="IF anual" value="12,34" />);

    expect(container.querySelector('.t-reel')).toBeTruthy();
  });

  it('anima el value cuando animateValue es true', () => {
    const { container } = render(<StatCard label="IF anual" value="12,34" animateValue />);

    expect(container.querySelector('.t-reel')).toBeTruthy();
  });

  it('permite desactivar la animación con animateValue={false}', () => {
    const { container } = render(<StatCard label="IF anual" value="12,34" animateValue={false} />);

    expect(container.querySelector('.t-reel')).toBeNull();
    expect(screen.getByText('12,34')).toBeInTheDocument();
  });

  it('no anima "Sin datos" aunque animateValue sea true', () => {
    const { container } = render(<StatCard label="IF anual" value="Sin datos" animateValue />);

    expect(screen.getByText('Sin datos')).toBeInTheDocument();
    expect(container.querySelector('.t-reel')).toBeNull();
  });

  it('acepta value numérico y lo renderiza como texto', () => {
    render(<StatCard label="Trabajadores" value={1234} animateValue={false} />);

    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renderiza la tarjeta sin BorderBeam (quitado a pedido explícito)', () => {
    const { container } = render(<StatCard label="IF anual" value="12,34" animateValue={false} />);

    expect(container.querySelector('[data-beam]')).toBeNull();
    expect(container.querySelector('[data-slot="card"]')).toBeTruthy();
  });
});
