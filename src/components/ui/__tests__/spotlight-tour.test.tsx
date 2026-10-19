import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  SpotlightTour,
  placeSpotlightCard,
  readSpotlightHole,
  resolveSpotlightTarget,
  spotlightTargetSelector,
  type SpotlightHole,
  type SpotlightStep,
} from '../spotlight-tour';

const STEPS: SpotlightStep[] = [
  { id: 'one', target: 'one', title: 'Primer control', description: 'Así se usa.' },
  { id: 'two', target: 'two', title: 'Segundo control' },
];

function TargetTree() {
  return (
    <>
      <button type="button" data-spotlight="one">
        Uno
      </button>
      <button type="button" data-spotlight="two">
        Dos
      </button>
    </>
  );
}

describe('resolveSpotlightTarget', () => {
  it('resuelve un id data-spotlight y un getter', () => {
    document.body.innerHTML = '<div data-spotlight="nav-modules">módulos</div>';
    expect(spotlightTargetSelector('nav-modules')).toBe('[data-spotlight="nav-modules"]');
    expect(resolveSpotlightTarget('nav-modules')?.textContent).toBe('módulos');
    expect(resolveSpotlightTarget(() => document.querySelector('div'))?.textContent).toBe(
      'módulos',
    );
    document.body.innerHTML = '';
  });
});

describe('placeSpotlightCard', () => {
  const hole: SpotlightHole = {
    top: 80,
    left: 20,
    width: 200,
    height: 400,
    radius: 16,
  };

  it('prefiere la derecha cuando cabe', () => {
    const placed = placeSpotlightCard(hole, { width: 320, height: 180 }, 'auto', {
      width: 1280,
      height: 800,
    });
    expect(placed.side).toBe('right');
    expect(placed.left).toBe(20 + 200 + 16);
  });

  it('centra la tarjeta si no hay recorte', () => {
    const placed = placeSpotlightCard(null, { width: 320, height: 180 }, 'auto', {
      width: 1000,
      height: 800,
    });
    expect(placed.top).toBe((800 - 180) / 2);
    expect(placed.left).toBe((1000 - 320) / 2);
  });
});

describe('readSpotlightHole', () => {
  it('ignora un objetivo sin caja medible', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(readSpotlightHole(el, 8)).toBeNull();
    el.remove();
  });
});

describe('SpotlightTour', () => {
  it('muestra el paso actual y avanza con Siguiente', () => {
    render(
      <>
        <TargetTree />
        <SpotlightTour open steps={STEPS} />
      </>,
    );

    expect(screen.getByRole('dialog', { name: 'Primer control' })).toBeInTheDocument();
    expect(screen.getByText('Así se usa.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(screen.getByRole('dialog', { name: 'Segundo control' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Listo' })).toBeInTheDocument();
  });

  it('Saltar y Escape cierran el tour', () => {
    const onOpenChange = vi.fn();
    const onSkip = vi.fn();
    render(
      <>
        <TargetTree />
        <SpotlightTour open steps={STEPS} onOpenChange={onOpenChange} onSkip={onSkip} />
      </>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    onSkip.mockClear();
    onOpenChange.mockClear();
    render(
      <>
        <TargetTree />
        <SpotlightTour open steps={STEPS} onOpenChange={onOpenChange} onSkip={onSkip} />
      </>,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onSkip).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('Listo dispara onComplete y no onSkip', () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();
    render(
      <>
        <TargetTree />
        <SpotlightTour open steps={STEPS} defaultStep={1} onComplete={onComplete} onSkip={onSkip} />
      </>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Listo' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onSkip).not.toHaveBeenCalled();
  });
});
