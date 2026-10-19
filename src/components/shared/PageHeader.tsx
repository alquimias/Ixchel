import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export const PAGE_HEADER_ACTION_HEIGHT_CLASS = 'h-9';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

type PageHeaderActionsProps = {
  children: ReactNode;
  className?: string;
};

function flattenPageHeaderActionChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (isValidElement(child) && child.type === Fragment) {
      return Children.toArray((child.props as { children?: ReactNode }).children);
    }
    return [child];
  });
}

/** Contenedor de acciones del encabezado; unifica altura de controles (36px). */
export function PageHeaderActions({ children, className }: PageHeaderActionsProps) {
  const items = flattenPageHeaderActionChildren(children);

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {items.map((child, index) => (
        <div
          key={isValidElement(child) && child.key != null ? child.key : index}
          className={cn('flex shrink-0 items-center', PAGE_HEADER_ACTION_HEIGHT_CLASS)}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      data-spotlight="page"
      className={cn(
        'mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-brand-lavender/20 pb-4',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <PageHeaderActions>{actions}</PageHeaderActions> : null}
    </div>
  );
}
