import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReelCounter } from '../ReelCounter';

describe('ReelCounter — accesibilidad', () => {
  it('anima como una sola imagen con nombre accesible igual al valor final', () => {
    render(<ReelCounter text="1.234,5" />);

    expect(screen.getByRole('img', { name: '1.234,5' })).toBeInTheDocument();
  });

  it('sin animación renderiza texto plano, sin rol de imagen', () => {
    render(<ReelCounter text="42" animate={false} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });
});
