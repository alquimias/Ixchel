import { act, render } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useAnimateWhenVisible } from '../use-animate-when-visible';

function Probe({ threshold }: { threshold?: number }) {
  const [ref, visible] = useAnimateWhenVisible<HTMLDivElement>(threshold);
  return (
    <div ref={ref} data-testid="probe">
      {visible ? 'visible' : 'hidden'}
    </div>
  );
}

describe('useAnimateWhenVisible', () => {
  let observe: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;
  let callback: IntersectionObserverCallback;

  beforeEach(() => {
    observe = vi.fn();
    disconnect = vi.fn();

    class MockIntersectionObserver {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('empieza oculto y se activa al intersectar', () => {
    const { getByTestId } = render(<Probe />);

    expect(getByTestId('probe')).toHaveTextContent('hidden');
    expect(observe).toHaveBeenCalled();

    act(() => {
      callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });

    expect(getByTestId('probe')).toHaveTextContent('visible');
    expect(disconnect).toHaveBeenCalled();
  });
});
