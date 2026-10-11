import { CalendarX, FileX, FilterX, Inbox, Lock, SearchX, type LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { CreateButton } from './CreateButton';
import { useShape } from '../../lib/shape-context';
import { cn } from '../../lib/utils';
import { UiLink } from '../../link';

/** Contextos frecuentes de estado vacío (D-21/UI-21) — cada uno con su propio ícono de línea. */
export type EmptyStateVariant =
  | 'table'
  | 'search'
  | 'filter'
  | 'permission'
  | 'document'
  | 'calendar';

const EMPTY_STATE_ICONS: Record<EmptyStateVariant, LucideIcon> = {
  table: Inbox,
  search: SearchX,
  filter: FilterX,
  permission: Lock,
  document: FileX,
  calendar: CalendarX,
};

/** Acción del CTA: navega a una ruta (`to`) o dispara un handler (`onClick`, p. ej. abrir un diálogo de creación). */
export type EmptyStateAction =
  | { label: string; to: string; onClick?: never; create?: boolean }
  | { label: string; onClick: () => void; to?: never; create?: boolean };

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: EmptyStateAction | null;
  /** Selecciona el ícono por contexto. Por defecto `table` (listado sin registros). */
  variant?: EmptyStateVariant;
  /** Ícono explícito; tiene prioridad sobre `variant` si se necesita uno fuera del set. */
  icon?: LucideIcon;
}

export function EmptyState({
  title,
  description,
  action,
  variant = 'table',
  icon,
}: EmptyStateProps) {
  const Icon = icon ?? EMPTY_STATE_ICONS[variant];
  const shape = useShape();

  return (
    <div className={cn('border border-border bg-card p-8 text-center', shape.container)}>
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent text-brand-soft">
        <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      {description ? (
        <p className={action ? 'mb-4 text-muted-foreground' : 'text-muted-foreground'}>
          {description}
        </p>
      ) : null}
      {action ? (
        action.create ? (
          <CreateButton to={action.to} onClick={action.onClick}>
            {action.label}
          </CreateButton>
        ) : action.to ? (
          <Button asChild>
            <UiLink to={action.to}>{action.label}</UiLink>
          </Button>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      ) : null}
    </div>
  );
}
