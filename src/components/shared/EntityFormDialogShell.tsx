import type { FormEvent, ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import type { IconComponent } from '../../lib/icon-context';

export interface EntityFormDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  submitLabel: string;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  /** Ícono de contexto junto al título. Por defecto `Pencil` (formulario de creación/edición). */
  icon?: IconComponent;
}

/**
 * JSX compartido por los formularios CRUD simples dentro de un `Dialog`
 * (`AreaCargoForm`, `SedeForm`, `RolForm`): `Dialog > DialogContent >
 * DialogHeader/DialogTitle`, el `<form>` con los campos específicos del
 * caller como `children`, y el `DialogFooter` con el botón único de submit
 * que muestra "Guardando…" mientras `isSaving` es `true`.
 */
export function EntityFormDialogShell({
  open,
  onOpenChange,
  title,
  submitLabel,
  isSaving,
  onSubmit,
  children,
  icon: Icon = Pencil,
}: EntityFormDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
            <Icon size={17} strokeWidth={2} />
          </span>
          <DialogTitle className="text-[15px]">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate>
          {children}

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando…' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
