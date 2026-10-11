import {
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/utils';

type StaggerRevealProps = {
  children: ReactNode;
  className?: string;
  /** Activa la entrada escalonada. */
  show?: boolean;
  /** Desvanece todas las líneas a la vez (sin revertir el stagger). */
  hide?: boolean;
};

type StaggerRevealLineProps<T extends ElementType> = {
  as?: T;
  /** Índice 1-based para el delay escalonado. */
  line?: number;
  /** Para líneas en flujo horizontal (p. ej. breadcrumbs). */
  inline?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children' | 'inline'>;

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

export function getStaggerLineDelay(line: number): string | undefined {
  if (line <= 1) return undefined;
  return `calc(var(--stagger-stagger) * ${line - 1})`;
}

function StaggerRevealLine<T extends ElementType = 'span'>({
  as,
  line = 1,
  inline = false,
  className,
  children,
  style,
  ...props
}: StaggerRevealLineProps<T>) {
  const Tag = (as ?? 'span') as ElementType;

  return (
    <Tag
      className={cn(
        't-stagger-line',
        line === 2 && 't-stagger-line--2',
        inline && 't-stagger-line--inline',
        className,
      )}
      style={{
        ...style,
        ...(line > 2 ? { transitionDelay: getStaggerLineDelay(line) } : {}),
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}

function StaggerRevealActive({ className, children }: { className?: string; children: ReactNode }) {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      setIsShown(false);
      innerFrame = requestAnimationFrame(() => {
        setIsShown(true);
      });
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, []);

  return <div className={cn('t-stagger', isShown && 'is-shown', className)}>{children}</div>;
}

function StaggerRevealRoot({ show = true, hide = false, className, children }: StaggerRevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  if (hide) {
    return <div className={cn('t-stagger is-hiding', className)}>{children}</div>;
  }

  if (!show) {
    return <div className={cn('t-stagger', className)}>{children}</div>;
  }

  return <StaggerRevealActive className={className}>{children}</StaggerRevealActive>;
}

export const StaggerReveal = Object.assign(StaggerRevealRoot, {
  Line: StaggerRevealLine,
});
