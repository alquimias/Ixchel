import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Textarea } from '../textarea';

describe('Textarea', () => {
  it('usa el mismo borde de reposo que InputField y Select', () => {
    render(<Textarea aria-label="Descripción" />);
    const el = screen.getByRole('textbox', { name: 'Descripción' });
    expect(el.className).toContain('border-border');
    expect(el.className).not.toContain('border-input');
  });
});
