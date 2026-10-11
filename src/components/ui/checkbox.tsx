import * as React from 'react';

import {
  Checkbox as CheckboxPrimitive,
  CheckboxIndicator as CheckboxIndicatorPrimitive,
  type CheckboxProps as CheckboxPrimitiveProps,
} from '../animate-ui/primitives/base/checkbox';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const checkboxVariants = cva(
  // D-32/UI-32: el check usa text-brand-black (fijo, no depende de modo)
  // en vez de text-primary-foreground -- brand-soft de fondo con
  // primary-foreground (casi blanco) encima fallaba 2.69:1 vs los 3:1 que
  // exige WCAG para iconografia. brand-black da 7.21:1 en claro y oscuro
  // porque ni brand-black ni brand-soft cambian entre modos.
  'peer shrink-0 flex items-center justify-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-500 focus-visible:ring-offset-2 [&[data-checked],&[data-indeterminate]]:bg-primary [&[data-checked],&[data-indeterminate]]:text-brand-black',
  {
    variants: {
      variant: {
        default: 'bg-background border',
        accent: 'bg-input',
      },
      size: {
        default: 'size-5 rounded-sm',
        sm: 'size-4.5 rounded-[5px]',
        lg: 'size-6 rounded-[7px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const checkboxIndicatorVariants = cva('', {
  variants: {
    size: {
      default: 'size-3.5',
      sm: 'size-3',
      lg: 'size-4',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const checkboxFieldVariants = cva('inline-flex items-center gap-1', {
  variants: {
    gap: {
      default: 'gap-1',
      relaxed: 'gap-1.5',
    },
  },
  defaultVariants: {
    gap: 'default',
  },
});

const checkboxLabelClassName =
  'cursor-pointer text-[13px] leading-none select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50';

type CheckboxProps = CheckboxPrimitiveProps &
  VariantProps<typeof checkboxVariants> &
  VariantProps<typeof checkboxFieldVariants> & {
    children?: React.ReactNode;
    label?: React.ReactNode;
    labelClassName?: string;
    fieldClassName?: string;
  };

function Checkbox({
  className,
  children,
  variant,
  size,
  gap,
  label,
  labelClassName,
  fieldClassName,
  id,
  ...props
}: CheckboxProps) {
  const control = (
    <CheckboxPrimitive
      id={id}
      className={cn(checkboxVariants({ variant, size, className }))}
      {...props}
    >
      {children}
      <CheckboxIndicatorPrimitive className={cn(checkboxIndicatorVariants({ size }))} />
    </CheckboxPrimitive>
  );

  if (label == null) {
    return control;
  }

  return (
    <div className={cn(checkboxFieldVariants({ gap }), fieldClassName)}>
      {control}
      <label htmlFor={id} className={cn(checkboxLabelClassName, labelClassName)}>
        {label}
      </label>
    </div>
  );
}

export { Checkbox, checkboxLabelClassName, type CheckboxProps };
