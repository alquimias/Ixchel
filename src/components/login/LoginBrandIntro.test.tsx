import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoginBrandIntro } from './LoginBrandIntro';

describe('LoginBrandIntro', () => {
  it('usa reveal escalonado en el bloque de marca', () => {
    const { container } = render(<LoginBrandIntro />);

    expect(container.querySelector('.t-stagger')).toBeTruthy();
    expect(container.querySelectorAll('.t-stagger-line').length).toBeGreaterThanOrEqual(3);
  });
});
