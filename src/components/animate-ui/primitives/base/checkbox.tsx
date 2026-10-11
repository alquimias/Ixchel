'use client';

import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';

import { cn } from '../../../../lib/utils';

type CheckedState = boolean | 'indeterminate';

type CheckboxContextType = {
  isChecked: boolean;
  isIndeterminate: boolean;
};

const CheckboxContext = React.createContext<CheckboxContextType | undefined>(undefined);

function useCheckbox() {
  const context = React.useContext(CheckboxContext);
  if (!context) {
    throw new Error('useCheckbox must be used within a Checkbox');
  }
  return context;
}

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>;

function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  children,
  className,
  ...props
}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = React.useState<CheckedState>(
    defaultChecked ?? false,
  );
  const resolvedChecked = checked !== undefined ? checked : internalChecked;
  const isIndeterminate = resolvedChecked === 'indeterminate';
  const isChecked = resolvedChecked === true;

  return (
    <CheckboxContext.Provider value={{ isChecked, isIndeterminate }}>
      <CheckboxPrimitive.Root
        data-slot="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(value) => {
          if (checked === undefined) {
            setInternalChecked(value);
          }
          onCheckedChange?.(value);
        }}
        className={cn(
          'transition-transform duration-200 hover:scale-105 active:scale-95',
          className,
        )}
        {...props}
      >
        {children}
      </CheckboxPrimitive.Root>
    </CheckboxContext.Provider>
  );
}

type CheckboxIndicatorProps = React.SVGProps<SVGSVGElement>;

function CheckboxIndicator({ className, ...props }: CheckboxIndicatorProps) {
  const { isChecked, isIndeterminate } = useCheckbox();
  const visible = isChecked || isIndeterminate;

  return (
    <CheckboxPrimitive.Indicator forceMount asChild>
      <span className="grid place-content-center text-current">
        <svg
          data-slot="checkbox-indicator"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="3.5"
          stroke="currentColor"
          aria-hidden
          className={cn(
            'transition-opacity duration-200',
            visible ? 'opacity-100' : 'opacity-0',
            className,
          )}
          {...props}
        >
          {isIndeterminate ? (
            <line
              x1="5"
              y1="12"
              x2="19"
              y2="12"
              strokeLinecap="round"
              className={cn(
                'origin-center transition-[stroke-dashoffset,opacity] duration-200',
                visible ? 'opacity-100 [stroke-dashoffset:0]' : 'opacity-0 [stroke-dashoffset:14]',
              )}
              style={{ strokeDasharray: 14 }}
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
              className={cn(
                'origin-center transition-[stroke-dashoffset,opacity] duration-200 delay-200',
                visible ? 'opacity-100 [stroke-dashoffset:0]' : 'opacity-0 [stroke-dashoffset:24]',
              )}
              style={{ strokeDasharray: 24 }}
            />
          )}
        </svg>
      </span>
    </CheckboxPrimitive.Indicator>
  );
}

export {
  Checkbox,
  CheckboxIndicator,
  useCheckbox,
  type CheckboxProps,
  type CheckboxIndicatorProps,
  type CheckboxContextType,
};
