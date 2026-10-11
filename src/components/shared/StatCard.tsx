import type { ReactNode } from 'react';
import { CardContent, CardHeader, CardTitle } from '../ui/card';
import { CardBeamShell } from './CardBeamShell';
import { ReelCounter } from './ReelCounter';

export interface StatCardProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  description?: string;
  trend?: ReactNode;
  className?: string;
  /** Anima el valor con contador tipo reel cuando el dato es numérico. */
  animateValue?: boolean;
}

function shouldAnimateStatValue(value: string | number): boolean {
  const text = String(value);
  return text !== 'Sin datos' && /\d/.test(text);
}

function renderStatValue(value: string | number, animateValue: boolean) {
  if (!animateValue || !shouldAnimateStatValue(value)) {
    return value;
  }

  return <ReelCounter text={String(value)} />;
}

/**
 * `StatCard` — autoria nueva sobre `Card`/`CardHeader`/`CardTitle`/
 * `CardContent` (sin precedente local). Primer consumidor real: Phase 28.
 * El `label` se clampea a 2 líneas para tolerar textos largos (p.ej.
 * "Índice de Frecuencia") sin romper la altura uniforme de la grilla de
 * KPIs; el `value` conserva `truncate` porque los valores reales
 * (`formatIndicadorValue`, es-CO, máx. 2 decimales, o "Sin datos") son
 * siempre cadenas cortas — ver 28-UI-SPEC.md Component Contracts.
 *
 * El shell (borde/hover) vive en `CardBeamShell`, compartido con las
 * tarjetas de alertas/notificaciones del dashboard para que todas se
 * perciban como un mismo sistema visual.
 */
export function StatCard({
  icon,
  label,
  value,
  description,
  trend,
  className,
  animateValue = true,
}: StatCardProps) {
  return (
    <CardBeamShell className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-sm font-medium text-muted-foreground">
          <span className="line-clamp-2">{label}</span>
          {icon ? (
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary-text flex items-center justify-center shrink-0">
              {icon}
            </div>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="truncate text-3xl font-semibold text-foreground tracking-tight tabular-nums">
          {renderStatValue(value, animateValue)}
        </p>
        {description ? (
          <p className="text-sm text-muted-foreground leading-normal">{description}</p>
        ) : null}
        {trend ? <div className="text-sm font-medium text-primary pt-1">{trend}</div> : null}
      </CardContent>
    </CardBeamShell>
  );
}
