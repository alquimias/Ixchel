import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Circle } from 'lucide-react';
import { Card, CardDescription, CardGroup, CardHeader, CardMedia, CardTitle } from './card';

function cardTitle() {
  return document.querySelector('[data-slot="card-title"]');
}

describe('Card', () => {
  it('renderiza título y descripción como partes composicionales', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Sede principal</CardTitle>
          <CardDescription>Bogotá</CardDescription>
        </CardHeader>
      </Card>,
    );

    expect(cardTitle()).toHaveTextContent('Sede principal');
    expect(screen.getByText('Bogotá')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="card"]')).toBeTruthy();
  });

  it('acepta size compact y el alias sm', () => {
    const { rerender } = render(
      <Card size="compact">
        <CardHeader>
          <CardTitle>Compacta</CardTitle>
        </CardHeader>
      </Card>,
    );

    expect(cardTitle()).toHaveTextContent('Compacta');

    rerender(
      <Card size="sm">
        <CardHeader>
          <CardTitle>Alias sm</CardTitle>
        </CardHeader>
      </Card>,
    );

    expect(cardTitle()).toHaveTextContent('Alias sm');
  });

  it('hace clickable toda la tarjeta cuando hay href', () => {
    render(
      <Card href="/sgsst/matriz" label="Matriz de peligros">
        <CardHeader>
          <CardTitle>Matriz</CardTitle>
        </CardHeader>
      </Card>,
    );

    const link = screen.getByRole('link', { name: 'Matriz de peligros' });
    expect(link).toHaveAttribute('href', '/sgsst/matriz');
  });
});

describe('CardGroup', () => {
  it('asigna índices de hover fluido a las tarjetas clickable', () => {
    render(
      <CardGroup>
        <Card href="#uno">
          <CardMedia icon={Circle} />
          <CardHeader>
            <CardTitle>Uno</CardTitle>
          </CardHeader>
        </Card>
        <Card href="#dos">
          <CardHeader>
            <CardTitle>Dos</CardTitle>
          </CardHeader>
        </Card>
      </CardGroup>,
    );

    const cards = document.querySelectorAll('[data-slot="card"]');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAttribute('data-fluid-hover-index', '0');
    expect(cards[1]).toHaveAttribute('data-fluid-hover-index', '1');
    expect(document.querySelector('[data-slot="card-group"]')).toBeTruthy();
  });
});
