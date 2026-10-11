import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';

import { cn } from '../../lib/utils';

/** Bajo 50 = danger, 50-79 = warning, 80+ = success -- pensado para valores
 * de cumplimiento normativo (0-100), donde el color es tan informativo como
 * el número (D-Progress). No aplica si `colorByValue` no se pasa: el fill
 * sigue siendo bg-primary por defecto, sin cambiar el comportamiento actual
 * de ningún consumidor existente. */
function toneClassFor(value: number): string {
  if (value < 50) return 'bg-destructive';
  if (value < 80) return 'bg-warning';
  return 'bg-success';
}

function Progress({
  className,
  value,
  colorByValue = false,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  /** Colorea el fill según el rango del valor (bajo/medio/alto) en vez del
   * color de marca fijo -- para barras que representan cumplimiento, no
   * progreso neutral. */
  colorByValue?: boolean;
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          'size-full flex-1 transition-all',
          colorByValue ? toneClassFor(value || 0) : 'bg-primary',
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
