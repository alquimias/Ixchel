import { render, screen } from '@testing-library/react';
import { ArrowRight, Plus } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { Button } from '../button';

describe('Button', () => {
  it('renderiza con variante primary por defecto', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('resuelve alias legacy outline a tertiary', () => {
    render(<Button variant="outline">Cancelar</Button>);
    const button = screen.getByRole('button', { name: 'Cancelar' });
    expect(button).toHaveAttribute('class');
    expect(button.className).toContain('text-foreground');
  });

  it('muestra trailingIcon cuando se proporciona', () => {
    render(
      <Button variant="primary" trailingIcon={ArrowRight}>
        Continuar
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
  });

  it('muestra leadingIcon cuando se proporciona', () => {
    render(
      <Button variant="primary" leadingIcon={Plus}>
        Nuevo
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Nuevo' })).toBeInTheDocument();
  });

  it('acepta icon como ReactNode en posición end', () => {
    render(<Button icon={<ArrowRight data-testid="plain-icon" />}>Guardar</Button>);
    expect(screen.getByTestId('plain-icon')).toBeInTheDocument();
  });
});
