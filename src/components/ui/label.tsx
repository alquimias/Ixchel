import * as React from 'react';
import { Label as LabelPrimitive } from 'radix-ui';

import { cva, type VariantProps } from 'class-variance-authority';

import { formFieldLabelClassName, formFieldLabelStyle } from '../../lib/form-field-styles';
import { cn } from '../../lib/utils';

const labelVariants = cva('', {
  variants: {
    variant: {
      field: formFieldLabelClassName,
      inline: 'text-[13px] leading-none select-none text-foreground cursor-pointer',
    },
  },
  defaultVariants: {
    variant: 'field',
  },
});

function Label({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        labelVariants({ variant }),
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      style={formFieldLabelStyle}
      {...props}
    />
  );
}

export { Label };
