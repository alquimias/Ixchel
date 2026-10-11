import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getFirstChangedBreadcrumbIndex, PageBreadcrumbs } from '../PageBreadcrumbs';

const TRAIL = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'RRHH' },
  { label: 'Trabajadores' },
];

function renderTrail(items = TRAIL) {
  return render(<PageBreadcrumbs items={items} />);
}

describe('getFirstChangedBreadcrumbIndex', () => {
  const base = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'SG-SST' },
    { label: 'Peligros' },
  ];

  it('devuelve la longitud del trail si no hay anterior (montaje inicial)', () => {
    expect(getFirstChangedBreadcrumbIndex(null, base)).toBe(3);
  });

  it('devuelve el índice del último segmento si solo cambia la hoja', () => {
    const next = [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'SG-SST' },
      { label: 'Accidentes' },
    ];

    expect(getFirstChangedBreadcrumbIndex(base, next)).toBe(2);
  });

  it('devuelve el primer índice distinto si cambia un segmento intermedio', () => {
    const next = [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Capacitación' },
      { label: 'Cursos' },
    ];

    expect(getFirstChangedBreadcrumbIndex(base, next)).toBe(1);
  });

  it('devuelve la longitud si el trail se acorta sin cambiar el prefijo', () => {
    const prev = [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'SG-SST' },
      { label: 'Peligros' },
    ];
    const next = [{ label: 'Dashboard', to: '/dashboard' }, { label: 'SG-SST' }];

    expect(getFirstChangedBreadcrumbIndex(prev, next)).toBe(2);
  });
});

describe('PageBreadcrumbs', () => {
  it('el crumb raíz "Dashboard" es un link hacia /dashboard', () => {
    renderTrail();

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
  });

  it('el crumb de módulo "RRHH" es texto plano sin rol link ni aria-current', () => {
    renderTrail();

    const modulo = screen.getByText('RRHH');
    expect(modulo).not.toHaveAttribute('role', 'link');
    expect(modulo).not.toHaveAttribute('aria-current');
    expect(screen.queryByRole('link', { name: 'RRHH' })).not.toBeInTheDocument();
  });

  it('el crumb terminal "Trabajadores" marca aria-current="page"', () => {
    renderTrail();

    expect(screen.getByText('Trabajadores')).toHaveAttribute('aria-current', 'page');
  });

  it('renderiza exactamente 2 separadores para un trail de 3 ítems', () => {
    const { container } = renderTrail();

    expect(container.querySelectorAll('[data-slot="breadcrumb-separator"]')).toHaveLength(2);
  });

  it('no anima segmentos en el montaje inicial', () => {
    const { container } = renderTrail();

    expect(container.querySelector('.t-stagger')).toBeNull();
    expect(container.querySelector('.t-stagger-line--inline')).toBeNull();
  });

  it('anima solo el último segmento cuando cambia la hoja del trail', () => {
    const initialTrail = [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'SG-SST' },
      { label: 'Peligros' },
    ];
    const nextTrail = [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'SG-SST' },
      { label: 'Accidentes' },
    ];

    const { container, rerender } = render(<PageBreadcrumbs items={initialTrail} />);

    rerender(<PageBreadcrumbs items={nextTrail} />);

    expect(screen.getByText('Accidentes')).toHaveAttribute('aria-current', 'page');
    expect(container.querySelectorAll('.t-stagger')).toHaveLength(1);
    expect(container.querySelectorAll('.t-stagger-line--inline')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Dashboard' }).closest('.t-stagger')).toBeNull();
    expect(screen.getByText('SG-SST').closest('.t-stagger')).toBeNull();
  });

  it('anima desde el primer segmento distinto si cambia un paso intermedio', () => {
    const initialTrail = [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'RRHH' },
      { label: 'Trabajadores' },
    ];
    const nextTrail = [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'SG-SST' },
      { label: 'Accidentes' },
    ];

    const { container, rerender } = render(<PageBreadcrumbs items={initialTrail} />);

    rerender(<PageBreadcrumbs items={nextTrail} />);

    expect(container.querySelectorAll('.t-stagger')).toHaveLength(2);
    expect(container.querySelectorAll('.t-stagger-line--inline')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Dashboard' }).closest('.t-stagger')).toBeNull();
  });
});
