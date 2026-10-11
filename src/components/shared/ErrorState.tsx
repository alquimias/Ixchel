import { CircleAlert } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { cn } from '../../lib/utils';

export interface ErrorStateProps {
  message: string;
  className?: string;
}

/** Mismo lenguaje de ícono de línea que EmptyState (D-22/UI-22): estado vacío y error comparten un sistema visual. */
export function ErrorState({ message, className }: ErrorStateProps) {
  return (
    <Alert variant="destructive" className={cn('mb-4', className)}>
      <CircleAlert aria-hidden="true" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
