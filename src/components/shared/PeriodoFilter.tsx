import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface PeriodoFilterProps {
  fechaDesde: string;
  fechaHasta: string;
  onFechaDesdeChange: (value: string) => void;
  onFechaHastaChange: (value: string) => void;
  onClear: () => void;
  className?: string;
}

const dateInputClass =
  'h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold shadow-sm focus:border-ring focus:outline-none';

/**
 * Filtro de periodo (Desde/Hasta) reutilizado por los listados con columna
 * de fecha (Trabajadores, Accidentes, Capacitaciones, EPP, Exámenes
 * médicos). Ambos extremos son independientes e inclusivos; el estado y su
 * persistencia en la URL viven en cada página, este componente es solo
 * presentación.
 */
export function PeriodoFilter({
  fechaDesde,
  fechaHasta,
  onFechaDesdeChange,
  onFechaHastaChange,
  onClear,
  className,
}: PeriodoFilterProps) {
  const hasFilter = Boolean(fechaDesde || fechaHasta);

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        Desde
        <input
          type="date"
          value={fechaDesde}
          max={fechaHasta || undefined}
          onChange={(event) => onFechaDesdeChange(event.target.value)}
          className={dateInputClass}
        />
      </label>
      <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        Hasta
        <input
          type="date"
          value={fechaHasta}
          min={fechaDesde || undefined}
          onChange={(event) => onFechaHastaChange(event.target.value)}
          className={dateInputClass}
        />
      </label>
      {hasFilter ? (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Limpiar periodo
        </Button>
      ) : null}
    </div>
  );
}
