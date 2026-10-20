import type { ReactNode } from 'react';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

export interface CardBeamShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * Shell visual compartido de toda tarjeta "premium" del dashboard: mismo
 * borde/radio/hover que `StatCard` (sin animación BorderBeam — se quitó a
 * pedido explícito, ver historial). Solo provee el contenedor — el
 * contenido interno (label/valor, badge/fila, lo que sea) lo define cada
 * consumidor.
 */
export function CardBeamShell({ children, className }: CardBeamShellProps) {
  return (
    <Card
      size="compact"
      className={cn(
        'border border-border hover:border-primary/40 transition-all duration-300 bg-card overflow-hidden relative group',
        className,
      )}
    >
      {children}
    </Card>
  );
}
