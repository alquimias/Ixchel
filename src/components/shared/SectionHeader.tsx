import type { ReactNode } from 'react';
import { StaggerReveal } from './StaggerReveal';
import { useAnimateWhenVisible } from '../../hooks/use-animate-when-visible';
import { cn } from '../../lib/utils';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** `accent` usa el punto de color del dashboard; `plain` es un encabezado de sección simple. */
  variant?: 'accent' | 'plain';
  dotColor?: string;
  className?: string;
  /** Revelado escalonado al entrar en viewport (por defecto en variant accent). */
  animateReveal?: boolean;
}

function AccentSectionHeader({
  title,
  description,
  actions,
  dotColor,
  className,
  animateReveal,
}: Omit<SectionHeaderProps, 'variant'>) {
  const [headerRef, isVisible] = useAnimateWhenVisible<HTMLDivElement>();
  const shouldAnimate = animateReveal ?? true;

  return (
    <div
      ref={headerRef}
      className={cn('space-y-1 border-b border-brand-lavender/20 pb-3', className)}
    >
      <StaggerReveal show={shouldAnimate ? isVisible : true}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: dotColor }}
              aria-hidden
            />
            <StaggerReveal.Line
              as="h2"
              line={1}
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              {title}
            </StaggerReveal.Line>
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
        {description ? (
          <StaggerReveal.Line as="p" line={2} className="pl-[18px] text-sm text-muted-foreground">
            {description}
          </StaggerReveal.Line>
        ) : null}
      </StaggerReveal>
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  actions,
  variant = 'plain',
  dotColor = 'var(--primary)',
  className,
  animateReveal,
}: SectionHeaderProps) {
  if (variant === 'accent') {
    return (
      <AccentSectionHeader
        title={title}
        description={description}
        actions={actions}
        dotColor={dotColor}
        className={className}
        animateReveal={animateReveal}
      />
    );
  }

  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0 space-y-1">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
