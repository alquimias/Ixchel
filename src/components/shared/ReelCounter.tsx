import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

const DEFAULT_SPINS = 2;

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return prefersReducedMotion;
}

type ReelCounterProps = {
  text: string;
  className?: string;
  /** Si es false, renderiza el texto sin animación. */
  animate?: boolean;
  /** Vueltas completas 0-9 antes de aterrizar en el dígito final. */
  spins?: number;
};

type TextToken =
  | { kind: 'digit'; value: number; key: string }
  | { kind: 'static'; value: string; key: string };

export function tokenizeReelText(text: string): TextToken[] {
  return text.split('').map((char, index) => {
    const parsed = Number.parseInt(char, 10);
    if (!Number.isNaN(parsed)) {
      return { kind: 'digit' as const, value: parsed, key: `${index}-${char}` };
    }
    return { kind: 'static' as const, value: char, key: `${index}-${char}` };
  });
}

function buildStripCells(spins: number): number[] {
  const cellCount = spins * 10 + 10;
  return Array.from({ length: cellCount }, (_, index) => index % 10);
}

function ReelDigitColumn({
  digit,
  colIndex,
  spins,
}: {
  digit: number;
  colIndex: number;
  spins: number;
}) {
  const filterId = useId().replace(/:/g, '');
  const stripRef = useRef<HTMLDivElement>(null);
  const gaussianRef = useRef<SVGFEGaussianBlurElement>(null);
  const cells = buildStripCells(spins);
  const offsetCells = spins * 10 + digit;

  useEffect(() => {
    const strip = stripRef.current;
    const gaussian = gaussianRef.current;
    if (!strip || !gaussian) return;

    const stagger = colIndex * 90;
    const duration = 1400;
    const root = strip.closest('.t-reel');
    const maxBlur = Number.parseFloat(
      getComputedStyle(root ?? document.documentElement).getPropertyValue('--reel-spin-blur') ||
        '3',
    );

    strip.style.transform = 'translateY(0)';
    strip.style.transition = 'none';
    gaussian.setAttribute('stdDeviation', `0 ${maxBlur}`);

    let outerFrame = 0;
    let innerFrame = 0;
    let blurFrame = 0;
    let cancelled = false;

    outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        if (cancelled) return;

        strip.style.transition = `transform var(--reel-dur) var(--reel-ease) ${stagger}ms`;
        strip.style.transform = `translateY(calc(-1 * var(--reel-cell) * ${offsetCells}))`;

        const start = performance.now() + stagger;
        const tick = (now: number) => {
          if (cancelled) return;

          const elapsed = now - start;
          if (elapsed < 0) {
            blurFrame = requestAnimationFrame(tick);
            return;
          }

          const progress = Math.min(elapsed / duration, 1);
          const blur = (1 - progress) * maxBlur;
          gaussian.setAttribute('stdDeviation', `0 ${blur}`);

          if (progress < 1) {
            blurFrame = requestAnimationFrame(tick);
          }
        };

        blurFrame = requestAnimationFrame(tick);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
      cancelAnimationFrame(blurFrame);
    };
  }, [digit, colIndex, spins, offsetCells]);

  return (
    <span className="t-reel-col" style={{ filter: `url(#${filterId})` }}>
      <svg aria-hidden className="absolute size-0" focusable="false">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur ref={gaussianRef} in="SourceGraphic" stdDeviation="0 0" />
          </filter>
        </defs>
      </svg>
      <div className="t-reel-strip" ref={stripRef}>
        {cells.map((cell, index) => (
          <span key={index} className="t-reel-digit">
            {cell}
          </span>
        ))}
      </div>
    </span>
  );
}

function buildReelRenderItems(tokens: TextToken[]) {
  const items: Array<{ token: TextToken; colIndex?: number }> = [];
  let digitCol = 0;

  for (const token of tokens) {
    if (token.kind === 'static') {
      items.push({ token });
      continue;
    }

    items.push({ token, colIndex: digitCol });
    digitCol += 1;
  }

  return items;
}

export function ReelCounter({
  text,
  className,
  animate = true,
  spins = DEFAULT_SPINS,
}: ReelCounterProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!animate || prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  const tokens = tokenizeReelText(text);
  const renderItems = buildReelRenderItems(tokens);

  return (
    // role="img": un aria-label sobre un span sin rol se ignora y los lectores
    // de pantalla recitarían las tiras 0-9 de cada columna; con este rol se
    // anuncia solo el valor final y los hijos son presentacionales.
    <span className={cn('t-reel', className)} role="img" aria-label={text}>
      {renderItems.map(({ token, colIndex }) => {
        if (token.kind === 'static') {
          return (
            <span key={token.key} className="t-reel-static">
              {token.value}
            </span>
          );
        }

        return (
          <ReelDigitColumn
            key={token.key}
            digit={token.value}
            colIndex={colIndex ?? 0}
            spins={spins}
          />
        );
      })}
    </span>
  );
}
