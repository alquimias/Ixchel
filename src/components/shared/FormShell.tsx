import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { useShape } from '../../lib/shape-context';

/** Contenedor de formulario sin ancho máximo: hereda todo el ancho de PageLayoutShell. */
export const FORM_SHELL_CLASS = 'w-full min-w-0';

/**
 * Clase de tarjeta aplicada por defecto al `<form>` interno. Sin radio: el
 * radio lo agrega `FormShell` en render vía `shape.container` (D-27/UI-27 —
 * antes era un `rounded-lg` fijo, el único primitivo de layout que quedó
 * desconectado de `shape-context` tras la Épica B).
 */
export const FORM_CARD_CLASS = 'border border-border bg-card p-6';

/** Grid de campos: 1 columna en móvil, 2 en `md`, 3 en `xl`. */
export const FORM_GRID_CLASS = 'grid gap-6 md:grid-cols-2 xl:grid-cols-3';

/** Span de fila completa para campos que deben abarcar toda la grid (p. ej. textareas). */
export const FORM_GRID_FULL_SPAN_CLASS = 'md:col-span-2 xl:col-span-3';

type FormShellProps = ComponentPropsWithoutRef<'form'> & {
  /** Aplica `FORM_CARD_CLASS` al `<form>`. Por defecto `true`. */
  card?: boolean;
  containerClassName?: string;
};

/**
 * Placeholder de carga con la misma forma que `FormShell` (D-27/UI-27).
 * Antes redeclarada localmente en 12 páginas Create/Edit, cada una con su
 * propio `rounded-lg` fijo — un único componente evita que el radio del
 * skeleton se desincronice del radio real una vez el formulario carga.
 */
export function FormShellSkeleton({ rows = 6 }: { rows?: number }) {
  const shape = useShape();
  return (
    <div className={cn('space-y-4', FORM_CARD_CLASS, shape.container)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded bg-muted" />
      ))}
    </div>
  );
}

/**
 * Mismo placeholder que `FormShellSkeleton`, para páginas de listado que
 * cargan antes de mostrar `DataTable` (D-27/UI-27) — antes redeclarada
 * localmente como `TableSkeleton` en 8 páginas con el mismo `rounded-lg`
 * fijo. Alias semántico, no una forma distinta: la tarjeta de carga es
 * idéntica exista una tabla o un formulario detrás.
 */
export function TableShellSkeleton({ rows = 4 }: { rows?: number }) {
  return <FormShellSkeleton rows={rows} />;
}

export function FormShell({
  card = true,
  containerClassName,
  className,
  children,
  ...formProps
}: FormShellProps) {
  const shape = useShape();
  return (
    <div className={cn(FORM_SHELL_CLASS, containerClassName)}>
      <form
        noValidate
        {...formProps}
        className={cn(card && FORM_CARD_CLASS, card && shape.container, className)}
      >
        {children}
      </form>
    </div>
  );
}

type FormSectionProps = {
  title: ReactNode;
  /** Texto/ayuda adicional bajo el título, dentro de la misma columna (p. ej. aviso de bloqueo). */
  description?: ReactNode;
  /** Acciones alineadas a la derecha del título (p. ej. "Solicitar firmas"); activa el layout de header en fila. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Sección de un formulario largo multi-sección (D-18/UI-18). Reemplaza el
 * patrón repetido `<section className="mb-6"><h2>...</h2>...</section>` +
 * `<Separator className="my-6" />` entre secciones por un borde-izquierdo de
 * acento — agrupa visualmente sin la línea horizontal completa. No usa
 * FORM_GRID_CLASS internamente: el grid de campos lo decide cada sección
 * llamadora, igual que antes.
 */
export function FormSection({
  title,
  description,
  actions,
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={cn('mb-8 border-l-2 border-brand-soft/25 pl-5', className)}>
      <div
        className={cn(
          'mb-4',
          actions && 'flex flex-col gap-4 md:flex-row md:items-start md:justify-between',
        )}
      >
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {description}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
