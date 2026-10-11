import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '../../lib/utils';
import { useShape } from '../../lib/shape-context';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1.5 border border-transparent px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-primary/15 text-primary-text dark:bg-primary/20',
        secondary: 'bg-secondary/35 text-secondary-foreground dark:bg-secondary/25',
        destructive: 'bg-destructive/15 text-destructive-text dark:bg-destructive/20',
        success: 'bg-success/15 text-success-text dark:bg-success/20',
        warning: 'bg-warning/20 text-warning-foreground dark:bg-warning/15 dark:text-warning',
        info: 'bg-info/15 text-info-text dark:bg-info/20',
        outline: 'bg-muted text-muted-foreground',
        ghost: 'text-muted-foreground',
        link: 'text-primary-text underline-offset-4 hover:underline',
        /** Sin color de variante: solo layout + punto; para estilos inline (p. ej. GTC-45). */
        unstyled: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant = 'default',
  asChild = false,
  showDot,
  children,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    /** Muestra el punto de acento. Por defecto false en outline/ghost/link/unstyled. */
    showDot?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'span';
  const shape = useShape();
  const dotlessByVariant =
    variant === 'ghost' || variant === 'link' || variant === 'outline' || variant === 'unstyled';
  const resolvedShowDot = showDot ?? !dotlessByVariant;

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-show-dot={resolvedShowDot ? 'true' : 'false'}
      className={cn(badgeVariants({ variant }), shape.item, className)}
      {...props}
    >
      {resolvedShowDot ? (
        <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      ) : null}
      {children}
    </Comp>
  );
}

export { Badge, badgeVariants };
