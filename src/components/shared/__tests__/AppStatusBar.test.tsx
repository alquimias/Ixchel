import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppStatusBar } from '../AppStatusBar';

const base = {
  environmentLabel: 'desarrollo',
  version: '1.16.0',
  health: { status: 'ok' as const, timestamp: '2026-06-17T00:00:00.000Z' },
};

describe('AppStatusBar', () => {
  it('variante login muestra producto, módulo, entorno, salud y versión', () => {
    render(
      <AppStatusBar
        {...base}
        variant="login"
        productName="BYTE"
        moduleLabel="SG-SST"
        privacyTo="/politica-privacidad"
      />,
    );

    expect(screen.getByText('BYTE')).toBeInTheDocument();
    expect(screen.getByText('SG-SST')).toBeInTheDocument();
    expect(screen.getByText(/Sistema operativo/)).toBeInTheDocument();
    expect(screen.getByTitle('Versión 1.16.0')).toBeInTheDocument();
    expect(screen.getByText('desarrollo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Política de datos' })).toHaveAttribute(
      'href',
      '/politica-privacidad',
    );
  });

  it('variante app muestra empresa, ruta y usuario', () => {
    const { container } = render(
      <AppStatusBar
        {...base}
        routeLabel="Trabajadores"
        userLabel="admin@byco.test"
        tenantName="BYCO Demo"
      />,
    );

    expect(screen.getByText('BYCO Demo')).toBeInTheDocument();
    expect(screen.getByText('Trabajadores')).toBeInTheDocument();
    expect(screen.getByText('admin@byco.test')).toBeInTheDocument();
    expect(container.querySelector('.w-\\(--sidebar-width\\)')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Política de datos' })).not.toBeInTheDocument();
  });

  it('columna de tenant usa ancho icono cuando el sidebar está colapsado', () => {
    const { container } = render(
      <AppStatusBar {...base} tenantName="BYCO Demo" sidebarCollapsed />,
    );

    expect(container.querySelector('.w-\\(--sidebar-width-icon\\)')).toBeTruthy();
    expect(screen.getByText('BYCO Demo')).toHaveClass('sr-only');
  });

  it('muestra el estado de error del sistema', () => {
    render(
      <AppStatusBar {...base} variant="login" productName="BYTE" health={{ status: 'error' }} />,
    );

    expect(screen.getByText('No se pudo verificar el estado del sistema')).toBeInTheDocument();
  });
});
