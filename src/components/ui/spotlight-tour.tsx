'use client';

import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'motion/react';
import { BorderBeam } from 'border-beam';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useShape } from '../../lib/shape-context';
import { spring } from '../../lib/springs';
import { Button } from './button';
import { CarouselDots } from './carousel-dots';

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const CARD_WIDTH = 352;
const CARD_ESTIMATE_HEIGHT = 220;
const DEFAULT_PADDING = 10;
const CARD_GAP = 16;
const VIEW_MARGIN = 16;
const TARGET_WAIT_MS = 1800;

export type SpotlightSide = 'top' | 'right' | 'bottom' | 'left';

export type SpotlightHole = {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number;
};

export type SpotlightStep = {
  id: string;
  /** `data-spotlight` id, CSS selector, or a live element getter. */
  target: string | (() => Element | null | undefined);
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  side?: SpotlightSide | 'auto';
  padding?: number;
  radius?: number;
  onEnter?: () => void | Promise<void>;
};

export type SpotlightTourLabels = {
  next?: string;
  back?: string;
  skip?: string;
  done?: string;
};

export type SpotlightTourProps = {
  open: boolean;
  steps: SpotlightStep[];
  step?: number;
  defaultStep?: number;
  onStepChange?: (index: number) => void;
  onOpenChange?: (open: boolean) => void;
  onComplete?: () => void;
  /** Escape o Saltar. Si no se pasa, cierra el tour. */
  onSkip?: () => void;
  /** Atrás en el primer paso del tour (p. ej. volver al carrusel). */
  onBack?: () => void;
  labels?: SpotlightTourLabels;
  /** Reemplaza los puntos del propio tour (p. ej. los del carrusel padre). */
  dots?: ReactNode;
  showDots?: boolean;
  showSkip?: boolean;
  showBack?: boolean;
};

const DEFAULT_LABELS: Required<SpotlightTourLabels> = {
  next: 'Siguiente',
  back: 'Atrás',
  skip: 'Saltar',
  done: 'Listo',
};

export function spotlightTargetSelector(id: string): string {
  const escaped =
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(id)
      : id.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `[data-spotlight="${escaped}"]`;
}

export function resolveSpotlightTarget(
  target: string | (() => Element | null | undefined),
): Element | null {
  if (typeof target === 'function') return target() ?? null;
  const trimmed = target.trim();
  if (!trimmed) return null;
  const asSelector =
    trimmed.startsWith('#') ||
    trimmed.startsWith('.') ||
    trimmed.startsWith('[');
  const selector = asSelector ? trimmed : spotlightTargetSelector(trimmed);
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

export function readSpotlightHole(
  element: Element,
  padding: number,
  radiusOverride?: number,
): SpotlightHole | null {
  const rect = element.getBoundingClientRect();
  if (rect.width < 2 && rect.height < 2) return null;
  const parsed = parseFloat(getComputedStyle(element).borderTopLeftRadius);
  const baseRadius = Number.isFinite(parsed) ? parsed : 12;
  const radius = radiusOverride ?? Math.min(baseRadius + padding * 0.5, 28);
  return {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
    radius,
  };
}

function overflowOf(
  pos: { top: number; left: number },
  size: { width: number; height: number },
  vw: number,
  vh: number,
): number {
  const overflowX =
    Math.max(0, VIEW_MARGIN - pos.left) +
    Math.max(0, pos.left + size.width + VIEW_MARGIN - vw);
  const overflowY =
    Math.max(0, VIEW_MARGIN - pos.top) +
    Math.max(0, pos.top + size.height + VIEW_MARGIN - vh);
  return overflowX + overflowY;
}

const SIDE_ORDER: SpotlightSide[] = ['right', 'bottom', 'left', 'top'];

export function placeSpotlightCard(
  hole: SpotlightHole | null,
  card: { width: number; height: number },
  preferred: SpotlightSide | 'auto',
  viewport: { width: number; height: number } = {
    width: typeof window === 'undefined' ? 1024 : window.innerWidth,
    height: typeof window === 'undefined' ? 768 : window.innerHeight,
  },
): { top: number; left: number; side: SpotlightSide } {
  const vw = viewport.width;
  const vh = viewport.height;
  const w = card.width;
  const h = card.height;

  if (!hole) {
    return {
      top: Math.max(VIEW_MARGIN, (vh - h) / 2),
      left: Math.max(VIEW_MARGIN, (vw - w) / 2),
      side: 'bottom',
    };
  }

  const positions: Record<SpotlightSide, { top: number; left: number }> = {
    right: {
      top: hole.top + hole.height / 2 - h / 2,
      left: hole.left + hole.width + CARD_GAP,
    },
    left: {
      top: hole.top + hole.height / 2 - h / 2,
      left: hole.left - w - CARD_GAP,
    },
    bottom: {
      top: hole.top + hole.height + CARD_GAP,
      left: hole.left + hole.width / 2 - w / 2,
    },
    top: {
      top: hole.top - h - CARD_GAP,
      left: hole.left + hole.width / 2 - w / 2,
    },
  };

  const order: SpotlightSide[] =
    preferred === 'auto'
      ? SIDE_ORDER
      : [preferred, ...SIDE_ORDER.filter((side) => side !== preferred)];

  let best = order[0];
  let bestOverflow = Number.POSITIVE_INFINITY;
  for (const side of order) {
    const overflow = overflowOf(positions[side], { width: w, height: h }, vw, vh);
    if (overflow < bestOverflow) {
      best = side;
      bestOverflow = overflow;
      if (overflow === 0) break;
    }
  }

  const chosen = positions[best];
  return {
    side: best,
    top: Math.min(
      Math.max(chosen.top, VIEW_MARGIN),
      Math.max(VIEW_MARGIN, vh - h - VIEW_MARGIN),
    ),
    left: Math.min(
      Math.max(chosen.left, VIEW_MARGIN),
      Math.max(VIEW_MARGIN, vw - w - VIEW_MARGIN),
    ),
  };
}

function useSpotlightHole(
  open: boolean,
  target: SpotlightStep['target'] | undefined,
  padding: number,
  radius?: number,
) {
  const [hole, setHole] = useState<SpotlightHole | null>(null);

  useEffect(() => {
    if (!open || target == null) return;

    let cancelled = false;
    let element: Element | null = null;
    let observer: ResizeObserver | null = null;
    let measureRaf = 0;

    const measure = () => {
      cancelAnimationFrame(measureRaf);
      measureRaf = requestAnimationFrame(() => {
        if (cancelled) return;
        setHole(element ? readSpotlightHole(element, padding, radius) : null);
      });
    };

    const attach = (found: Element) => {
      if (element === found) return;
      element = found;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      found.scrollIntoView?.({
        block: 'nearest',
        inline: 'nearest',
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
      observer?.disconnect();
      observer = new ResizeObserver(measure);
      observer.observe(found);
      if (found.parentElement) observer.observe(found.parentElement);
      measure();
    };

    const tryFind = () => {
      const found = resolveSpotlightTarget(target);
      if (found) attach(found);
    };

    const raf = requestAnimationFrame(tryFind);
    const interval = window.setInterval(tryFind, 50);
    const timeout = window.setTimeout(() => window.clearInterval(interval), TARGET_WAIT_MS);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(measureRaf);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, target, padding, radius]);

  return open ? hole : null;
}

export function SpotlightTarget({
  id,
  children,
}: {
  id: string;
  children: ReactElement;
}) {
  return cloneElement(children, {
    'data-spotlight': id,
  } as { 'data-spotlight': string });
}

function SpotlightCard({
  step,
  stepIndex,
  stepCount,
  labels,
  dots,
  showDots,
  showSkip,
  showBack,
  position,
  reduced,
  onNext,
  onBack,
  onSkip,
  onGoTo,
}: {
  step: SpotlightStep;
  stepIndex: number;
  stepCount: number;
  labels: Required<SpotlightTourLabels>;
  dots?: ReactNode;
  showDots: boolean;
  showSkip: boolean;
  showBack: boolean;
  position: { top: number; left: number };
  reduced: boolean;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  onGoTo?: (index: number) => void;
}) {
  const shape = useShape();
  const titleId = useId();
  const descriptionId = useId();
  const last = stepIndex >= stepCount - 1;
  const nextLabel = last ? labels.done : labels.next;
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    nextRef.current?.focus();
  }, [step.id]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={step.description ? descriptionId : undefined}
      data-slot="spotlight-card"
      className={cn(
        'pointer-events-auto absolute z-[1] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-4 bg-popover p-4 text-popover-foreground shadow-lg ring-1 ring-foreground/10',
        shape.container,
      )}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, top: position.top, left: position.left }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      transition={reduced ? { duration: 0 } : spring.moderate}
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex flex-col gap-2">
        {step.eyebrow ? (
          <p className="text-[11px] font-bold tracking-[0.18em] text-brand-soft uppercase">
            {step.eyebrow}
          </p>
        ) : null}
        <h2
          id={titleId}
          className="font-display text-xl leading-tight font-extrabold tracking-tight text-foreground"
        >
          {step.title}
        </h2>
        {step.description ? (
          <div
            id={descriptionId}
            className="text-sm leading-relaxed text-muted-foreground"
          >
            {step.description}
          </div>
        ) : null}
      </div>

      {showDots
        ? (dots ?? (
            <CarouselDots
              count={stepCount}
              value={stepIndex}
              onValueChange={(index) => {
                if (index === stepIndex) return;
                onGoTo?.(index);
              }}
              getLabel={(index) => `Ir al paso ${index + 1}`}
              aria-label="Pasos"
            />
          ))
        : null}

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          {showBack ? (
            <Button type="button" variant="ghost" arrow={false} onClick={onBack}>
              {labels.back}
            </Button>
          ) : null}
          {showSkip ? (
            <Button type="button" variant="ghost" arrow={false} onClick={onSkip}>
              {labels.skip}
            </Button>
          ) : null}
        </div>
        <Button
          ref={nextRef}
          type="button"
          trailingIcon={last ? undefined : ArrowRight}
          arrow={false}
          onClick={onNext}
        >
          {nextLabel}
        </Button>
      </div>
    </motion.div>
  );
}

function SpotlightTourLayer({
  steps,
  stepIndex,
  labels,
  dots,
  showDots,
  showSkip,
  showBack,
  onNext,
  onBack,
  onSkip,
  onGoTo,
}: {
  steps: SpotlightStep[];
  stepIndex: number;
  labels: Required<SpotlightTourLabels>;
  dots?: ReactNode;
  showDots: boolean;
  showSkip: boolean;
  showBack: boolean;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  onGoTo?: (index: number) => void;
}) {
  const step = steps[stepIndex];
  const reduced = useReducedMotion() === true;
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardSize, setCardSize] = useState({
    width: CARD_WIDTH,
    height: CARD_ESTIMATE_HEIGHT,
  });
  const hole = useSpotlightHole(
    Boolean(step),
    step?.target,
    step?.padding ?? DEFAULT_PADDING,
    step?.radius,
  );

  useEffect(() => {
    if (!step?.onEnter) return;
    void step.onEnter();
  }, [step]);

  useIsoLayoutEffect(() => {
    const node = cardRef.current?.querySelector('[data-slot="spotlight-card"]');
    if (!(node instanceof HTMLElement)) return;
    const rect = node.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    setCardSize((prev) =>
      prev.width === rect.width && prev.height === rect.height
        ? prev
        : { width: rect.width, height: rect.height },
    );
  }, [step?.id, hole, stepIndex]);

  const position = placeSpotlightCard(hole, cardSize, step?.side ?? 'auto');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onSkip?.();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
        return;
      }
      if (event.key === 'ArrowLeft' && showBack) {
        event.preventDefault();
        onBack?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack, onNext, onSkip, showBack]);

  if (!step) return null;

  return (
    <motion.div
      ref={cardRef}
      className="fixed inset-0 z-[100] overflow-hidden"
      data-slot="spotlight-tour"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0 }}
      transition={reduced ? { duration: 0 } : spring.moderate}
    >
      <div className="absolute inset-0" aria-hidden />
      {hole ? (
        <motion.div
          aria-hidden
          className={cn(
            'pointer-events-none absolute bg-transparent',
            '[box-shadow:0_0_0_999vmax_color-mix(in_oklab,var(--color-brand-black)_48%,transparent)]',
            'dark:[box-shadow:0_0_0_999vmax_color-mix(in_oklab,var(--color-brand-ghost)_16%,transparent)]',
          )}
          initial={false}
          animate={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
            borderRadius: hole.radius,
          }}
          transition={reduced ? { duration: 0 } : spring.slow}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[color-mix(in_oklab,var(--color-brand-black)_48%,transparent)] dark:bg-[color-mix(in_oklab,var(--color-brand-ghost)_16%,transparent)]"
        />
      )}
      {hole ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute overflow-visible"
          initial={false}
          animate={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
          }}
          transition={reduced ? { duration: 0 } : spring.slow}
        >
          <BorderBeam
            className="block h-full w-full overflow-visible"
            size="md"
            theme="auto"
            colorVariant="ocean"
            strength={0.85}
            brightness={1.35}
            hueRange={16}
            duration={4.2}
            borderRadius={hole.radius}
            active={!reduced}
          >
            <div
              className="h-full w-full ring-1 ring-brand-soft/35"
              style={{ borderRadius: hole.radius }}
            />
          </BorderBeam>
        </motion.div>
      ) : null}
      <SpotlightCard
        step={step}
        stepIndex={stepIndex}
        stepCount={steps.length}
        labels={labels}
        dots={dots}
        showDots={showDots}
        showSkip={showSkip}
        showBack={showBack}
        position={position}
        reduced={reduced}
        onNext={onNext}
        onBack={onBack}
        onSkip={onSkip}
        onGoTo={onGoTo}
      />
    </motion.div>
  );
}

function SpotlightTour({
  open,
  steps,
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  onOpenChange,
  onComplete,
  onSkip: onSkipProp,
  onBack,
  labels: labelsProp,
  dots,
  showDots = true,
  showSkip = true,
  showBack,
}: SpotlightTourProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultStep);
  const controlled = stepProp !== undefined;
  const stepIndex = controlled ? stepProp : uncontrolled;
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const lastIndex = Math.max(0, steps.length - 1);
  const clamped = Math.min(Math.max(stepIndex, 0), lastIndex);
  const canGoBack = showBack ?? (clamped > 0 || Boolean(onBack));

  const setStep = useCallback(
    (next: number) => {
      if (!controlled) setUncontrolled(next);
      onStepChange?.(next);
    },
    [controlled, onStepChange],
  );

  const close = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const dismiss = useCallback(() => {
    onSkipProp?.();
    onOpenChange?.(false);
  }, [onOpenChange, onSkipProp]);

  const goNext = useCallback(() => {
    if (clamped >= lastIndex) {
      onComplete?.();
      close();
      return;
    }
    setStep(clamped + 1);
  }, [clamped, close, lastIndex, onComplete, setStep]);

  const goBack = useCallback(() => {
    if (clamped <= 0) {
      onBack?.();
      return;
    }
    setStep(clamped - 1);
  }, [clamped, onBack, setStep]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && steps.length > 0 ? (
        <SpotlightTourLayer
          key="spotlight-tour"
          steps={steps}
          stepIndex={clamped}
          labels={labels}
          dots={dots}
          showDots={showDots}
          showSkip={showSkip}
          showBack={canGoBack}
          onNext={goNext}
          onBack={canGoBack ? goBack : undefined}
          onSkip={dismiss}
          onGoTo={setStep}
        />
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

type SpotlightTourStartOptions = {
  onComplete?: () => void;
};

type SpotlightTourContextValue = {
  start: (steps: SpotlightStep[], options?: SpotlightTourStartOptions) => void;
  stop: () => void;
  running: boolean;
};

const SpotlightTourContext = createContext<SpotlightTourContextValue | null>(
  null,
);

function SpotlightTourProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{
    steps: SpotlightStep[];
    step: number;
    onComplete?: () => void;
  } | null>(null);

  const start = useCallback(
    (nextSteps: SpotlightStep[], options?: SpotlightTourStartOptions) => {
      if (nextSteps.length === 0) return;
      setSession({
        steps: nextSteps,
        step: 0,
        onComplete: options?.onComplete,
      });
    },
    [],
  );

  const stop = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      start,
      stop,
      running: session !== null,
    }),
    [session, start, stop],
  );

  return (
    <SpotlightTourContext.Provider value={value}>
      {children}
      <SpotlightTour
        open={session !== null}
        steps={session?.steps ?? []}
        step={session?.step ?? 0}
        onStepChange={(index) =>
          setSession((current) => (current ? { ...current, step: index } : current))
        }
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSession(null);
        }}
        onComplete={() => {
          session?.onComplete?.();
        }}
      />
    </SpotlightTourContext.Provider>
  );
}

function useSpotlightTour() {
  const ctx = useContext(SpotlightTourContext);
  if (!ctx) {
    throw new Error('useSpotlightTour must be used within a SpotlightTourProvider');
  }
  return ctx;
}

export { SpotlightTour, SpotlightTourProvider, useSpotlightTour };
export type { SpotlightTourContextValue, SpotlightTourStartOptions };
