import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CarouselDots } from '../carousel-dots';

function ControlledDots() {
  const [value, setValue] = useState(0);
  return (
    <CarouselDots
      count={3}
      value={value}
      onValueChange={setValue}
      getLabel={(index) => `Ir al paso ${index + 1}`}
      aria-label="Pasos"
    />
  );
}

describe('CarouselDots', () => {
  it('marca el paso actual y permite saltar a otro', () => {
    render(<ControlledDots />);

    const first = screen.getByRole('button', { name: 'Ir al paso 1' });
    const third = screen.getByRole('button', { name: 'Ir al paso 3' });

    expect(screen.getByRole('group', { name: 'Pasos' })).toBeInTheDocument();
    expect(first).toHaveAttribute('aria-current', 'true');
    expect(third).not.toHaveAttribute('aria-current');

    fireEvent.click(third);

    expect(third).toHaveAttribute('aria-current', 'true');
    expect(first).not.toHaveAttribute('aria-current');
  });
});
