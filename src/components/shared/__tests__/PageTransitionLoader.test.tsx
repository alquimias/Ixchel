import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageTransitionLoader } from '../PageTransitionLoader';
import {
  pageTransitionLoaderDefaults,
  pageTransitionLoaderThemeStyle,
} from '../pageTransitionLoaderConfig';

describe('PageTransitionLoader', () => {
  it('usa --foreground para que los cuadros contrasten en modo claro y oscuro', () => {
    expect(pageTransitionLoaderDefaults.color).toBe('var(--foreground)');
    expect(pageTransitionLoaderThemeStyle).toEqual(
      expect.objectContaining({ '--color-dot-on': 'var(--foreground)' }),
    );

    const { container } = render(<PageTransitionLoader />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--color-dot-on')).toBe('var(--foreground)');
  });
});
