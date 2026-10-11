import { SectionHeader } from '../SectionHeader';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getStaggerLineDelay } from '../StaggerReveal';
import { StaggerReveal } from '../StaggerReveal';

describe('getStaggerLineDelay', () => {
  it('no aplica delay en la primera línea', () => {
    expect(getStaggerLineDelay(1)).toBeUndefined();
  });

  it('calcula delay escalonado para líneas posteriores', () => {
    expect(getStaggerLineDelay(2)).toBe('calc(var(--stagger-stagger) * 1)');
    expect(getStaggerLineDelay(3)).toBe('calc(var(--stagger-stagger) * 2)');
  });
});

describe('StaggerReveal', () => {
  it('renderiza líneas con clases de stagger', () => {
    const { container } = render(
      <StaggerReveal show={false}>
        <StaggerReveal.Line as="h1" line={1}>
          Título
        </StaggerReveal.Line>
        <StaggerReveal.Line as="p" line={2}>
          Subtítulo
        </StaggerReveal.Line>
      </StaggerReveal>,
    );

    expect(container.querySelector('.t-stagger-line--2')).toBeTruthy();
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Subtítulo')).toBeInTheDocument();
  });
});

describe('SectionHeader', () => {
  beforeEach(() => {
    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
      constructor() {}
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('variante accent usa reveal escalonado', () => {
    const { container } = render(
      <SectionHeader
        variant="accent"
        title="Indicadores del Sistema"
        description="Métricas clave del año en curso."
      />,
    );

    expect(screen.getByText('Indicadores del Sistema')).toBeInTheDocument();
    expect(container.querySelector('.t-stagger')).toBeTruthy();
    expect(container.querySelector('.t-stagger-line--2')).toBeTruthy();
  });
});
