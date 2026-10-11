import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoginScreenDivider } from './LoginScreenDivider';

describe('LoginScreenDivider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza el divisor con border beam en desktop', async () => {
    class ResizeObserverMock {
      private readonly callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }

      observe(target: Element) {
        Object.defineProperty(target, 'clientHeight', {
          configurable: true,
          value: 600,
        });
        this.callback([{ target } as ResizeObserverEntry], this);
      }

      unobserve() {}

      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', ResizeObserverMock);

    const { container } = render(
      <div className="relative h-[600px]">
        <LoginScreenDivider />
      </div>,
    );

    await waitFor(() => {
      expect(container.querySelector('[data-beam]')).toBeTruthy();
    });
    expect(container.querySelector('.lg\\:block')).toBeTruthy();
  });

  it('acepta className adicional', () => {
    const { container } = render(<LoginScreenDivider className="mi-divisor" />);

    expect(container.firstChild).toHaveClass('mi-divisor');
  });
});
