import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import type { IconComponent } from '../../lib/icon-context';
import { cn } from '../../lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  onConfirm: () => void;
  isPending?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
  /** Clases adicionales para el `DialogTitle` (p. ej. para títulos con badges inline). */
  titleClassName?: string;
  /** Contenido adicional renderizado entre el header y el footer (p. ej. un `ErrorState` inline). */
  children?: ReactNode;
  /** Ícono de contexto junto al título. Por defecto `Trash2` (acción destructiva). */
  icon?: IconComponent;
}

/**
 * Diálogo de confirmación genérico para acciones destructivas. Consolida el
 * esqueleto `Dialog > DialogContent(showCloseButton={false}) > DialogHeader >
 * DialogTitle + DialogDescription` con `DialogFooter` (botón "No, mantener" +
 * botón destructivo) que se repetía idéntico en los diálogos de eliminación
 * de sgsst.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isPending = false,
  cancelLabel = 'No, mantener',
  confirmLabel = 'Eliminar',
  titleClassName,
  children,
  icon: Icon = Trash2,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="flex-row items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive-light text-destructive">
            <Icon size={17} strokeWidth={2} />
          </span>
          <div className="flex flex-col gap-1">
            <DialogTitle className={cn('text-[15px]', titleClassName)}>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </DialogHeader>
        {children}
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
