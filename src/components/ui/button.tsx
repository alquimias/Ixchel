'use client';

import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ArrowRight } from 'lucide-react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import type { IconComponent } from '../../lib/icon-context';
import { cn } from '../../lib/utils';
import { useShape } from '../../lib/shape-context';
import { useSizeVariant } from '../../lib/size-context';
import { UiLink } from '../../link';

const buttonVariants = cva(
  [
    'group relative isolate inline-flex items-center justify-center outline-none cursor-pointer',
    'transition-colors duration-80',
    'disabled:opacity-50 disabled:pointer-events-none',
    'focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring,#6B97FF)]',
  ],
  {
    variants: {
      variant: {
        primary: 'text-background shadow-sm',
        secondary: 'text-foreground shadow-sm',
        tertiary: 'text-foreground shadow-sm',
        ghost: 'text-muted-foreground hover:text-foreground',
        destructive: 'text-white shadow-sm',
      },
      size: {
        default: 'min-h-10 px-4 py-2.5 text-sm font-medium gap-2',
        compact: 'h-7 px-3 text-[12px] font-medium gap-1',
        icon: 'h-9 w-9 p-0 [&_svg]:h-4 [&_svg]:w-4',
        'icon-compact': 'h-7 w-7 p-0 [&_svg]:h-3.5 [&_svg]:w-3.5',
      },
      iconLeft: { true: '' },
      iconRight: { true: '' },
    },
    compoundVariants: [
      { size: 'compact', iconLeft: true, className: 'pl-[6px]' },
      { size: 'compact', iconRight: true, className: 'pr-[6px]' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

type ButtonVariantCanonical = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive';

type LegacyButtonVariant = 'default' | 'outline' | 'link' | 'iconReveal';

export type ButtonVariant = ButtonVariantCanonical | LegacyButtonVariant;

const legacyVariantAliases: Record<LegacyButtonVariant, ButtonVariantCanonical> = {
  default: 'primary',
  outline: 'tertiary',
  link: 'ghost',
  iconReveal: 'primary',
};

type ButtonSizeCanonical = 'default' | 'compact' | 'icon' | 'icon-compact';

export type ButtonSize = ButtonSizeCanonical | 'xs' | 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon-lg';

const legacySizeAliases: Partial<Record<ButtonSize, ButtonSizeCanonical>> = {
  xs: 'compact',
  sm: 'compact',
  md: 'default',
  lg: 'default',
  'icon-sm': 'icon-compact',
  'icon-lg': 'icon',
};

const bgVariants: Record<ButtonVariantCanonical, string> = {
  primary:
    '[--btn-bg:var(--foreground)] group-hover:[--btn-bg:color-mix(in_oklab,var(--foreground)_90%,var(--background))] group-active:[--btn-bg:color-mix(in_oklab,var(--foreground)_80%,var(--background))] bg-[var(--btn-bg)] shadow-[0_0_0_1px_var(--btn-bg)] group-active:shadow-[0_0_0_0px_var(--btn-bg)]',
  secondary:
    '[--btn-bg:var(--accent)] group-hover:[--btn-bg:color-mix(in_oklab,var(--accent)_80%,var(--background))] group-active:[--btn-bg:var(--accent)] bg-[var(--btn-bg)] shadow-[0_0_0_1px_var(--btn-bg)] group-active:shadow-[0_0_0_0px_var(--btn-bg)]',
  tertiary:
    'bg-transparent shadow-[0_0_0_1px_var(--border),inset_0_0_0_0px_var(--border)] group-hover:bg-hover group-active:bg-active group-active:shadow-[0_0_0_0px_var(--border),inset_0_0_0_1px_var(--border)]',
  ghost:
    'bg-transparent shadow-[0_0_0_1px_transparent] group-hover:bg-hover group-hover:shadow-[0_0_0_1px_var(--hover)] group-active:bg-active group-active:shadow-[0_0_0_0px_var(--active)]',
  destructive:
    '[--btn-bg:var(--destructive)] group-hover:[--btn-bg:color-mix(in_oklab,var(--destructive)_90%,var(--background))] group-active:[--btn-bg:color-mix(in_oklab,var(--destructive)_80%,var(--background))] bg-[var(--btn-bg)] shadow-[0_0_0_1px_var(--btn-bg)] group-active:shadow-[0_0_0_0px_var(--btn-bg)]',
};

const activeBgVariants: Record<ButtonVariantCanonical, string> = {
  primary:
    '[--btn-bg:color-mix(in_oklab,var(--foreground)_80%,var(--background))] bg-[var(--btn-bg)] shadow-[0_0_0_1px_var(--btn-bg)] group-active:shadow-[0_0_0_0px_var(--btn-bg)]',
  secondary:
    '[--btn-bg:var(--accent)] bg-[var(--btn-bg)] shadow-[0_0_0_1px_var(--btn-bg)] group-active:shadow-[0_0_0_0px_var(--btn-bg)]',
  tertiary:
    'bg-active shadow-[0_0_0_1px_var(--border),inset_0_0_0_0px_var(--border)] group-active:shadow-[0_0_0_0px_var(--border),inset_0_0_0_1px_var(--border)]',
  ghost: 'bg-active shadow-[0_0_0_1px_var(--active)] group-active:shadow-[0_0_0_0px_var(--active)]',
  destructive:
    '[--btn-bg:color-mix(in_oklab,var(--destructive)_80%,var(--background))] bg-[var(--btn-bg)] shadow-[0_0_0_1px_var(--btn-bg)] group-active:shadow-[0_0_0_0px_var(--btn-bg)]',
};

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  loading?: boolean;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  active?: boolean;
  to?: string;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  /**
   * Flecha hacia la derecha tras el texto. Por defecto aparece solo en el botón
   * `primary` de tamaño normal, con texto y sin otro ícono propio; `false` la quita
   * y `true` la fuerza en otras variantes.
   */
  arrow?: boolean;
}

function resolveVariant(variant: ButtonVariant | null | undefined): ButtonVariantCanonical {
  if (!variant) return 'primary';
  if (variant in legacyVariantAliases) {
    return legacyVariantAliases[variant as LegacyButtonVariant];
  }
  return variant as ButtonVariantCanonical;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leadingIcon: LeadingIcon,
      trailingIcon: TrailingIconProp,
      arrow,
      active = false,
      disabled,
      children,
      style,
      to,
      icon,
      iconPosition = 'end',
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const asChildElement =
      asChild && isValidElement(children)
        ? (children as ReactElement<{
            children?: ReactNode;
            className?: string;
            style?: React.CSSProperties;
            ref?: React.Ref<HTMLButtonElement>;
          }>)
        : null;
    const label = asChildElement ? asChildElement.props.children : children;

    const contextSize = useSizeVariant();
    const resolvedSize: ButtonSizeCanonical = size
      ? (legacySizeAliases[size] ?? (size as ButtonSizeCanonical))
      : contextSize === 'compact'
        ? 'compact'
        : 'default';

    const resolvedVariant = resolveVariant(variant);
    const isLinkVariant = variant === 'link';
    const isIconOnly = resolvedSize === 'icon' || resolvedSize === 'icon-compact';
    const isCompact = resolvedSize === 'compact' || resolvedSize === 'icon-compact';
    const iconSize = isCompact ? 14 : 16;
    const hasOwnIcon = icon != null || !!LeadingIcon || !!TrailingIconProp;
    const showArrow =
      arrow ??
      (resolvedVariant === 'primary' &&
        resolvedSize === 'default' &&
        !isLinkVariant &&
        !isIconOnly &&
        !hasOwnIcon);
    const TrailingIcon =
      TrailingIconProp ?? (showArrow ? (ArrowRight as IconComponent) : undefined);
    const trailingIconLoading = TrailingIcon ? (
      <TrailingIcon size={iconSize} strokeWidth={2} />
    ) : null;
    const trailingIconIdle = TrailingIcon ? (
      <TrailingIcon
        size={iconSize}
        strokeWidth={1.5}
        className="transition-[stroke-width] duration-80 group-hover:stroke-[2]"
      />
    ) : null;
    const hasIconNode = icon != null && !LeadingIcon && !TrailingIcon;
    const showLeadingIcon = !hasIconNode && !!LeadingIcon;
    const showTrailingIcon =
      (!hasIconNode && !!TrailingIcon) || (hasIconNode && iconPosition === 'end');
    const showLeadingIconNode = hasIconNode && iconPosition === 'start';

    const spinnerSizeClass = isCompact ? 'h-7 w-7' : 'h-9 w-9';
    const shape = useShape();
    const bgClass = active ? activeBgVariants[resolvedVariant] : bgVariants[resolvedVariant];

    const internals = (
      <>
        <span
          aria-hidden
          className={cn(
            'absolute inset-px rounded-[inherit] transition-[box-shadow,background-color] [transition-duration:180ms,80ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1),ease] group-active:[transition-duration:80ms,80ms]',
            bgClass,
          )}
        />
        <span className="relative inline-flex items-center justify-center gap-[inherit]">
          {loading ? (
            <>
              <span className="flex items-center justify-center gap-[inherit] opacity-0">
                {showLeadingIcon && !isIconOnly && <LeadingIcon size={iconSize} strokeWidth={2} />}
                {showLeadingIconNode && !isIconOnly && icon}
                {label}
                {showTrailingIcon && !isIconOnly && (hasIconNode ? icon : trailingIconLoading)}
              </span>
              <span className="absolute inset-0 flex items-center justify-center">
                <svg className={spinnerSizeClass} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M 12 12 C 14 8.5 19 8.5 19 12 C 19 15.5 14 15.5 12 12 C 10 8.5 5 8.5 5 12 C 5 15.5 10 15.5 12 12 Z"
                    stroke="currentColor"
                    strokeWidth="1.125"
                    strokeLinecap="round"
                    pathLength="100"
                    style={{
                      strokeDasharray: '15 85',
                      animation:
                        'spinner-move 2s linear infinite, spinner-dash 4s ease-in-out infinite',
                    }}
                  />
                </svg>
              </span>
            </>
          ) : isIconOnly ? (
            <span className="[&_svg]:stroke-[1.5] [&_svg]:transition-[stroke-width] [&_svg]:duration-80 group-hover:[&_svg]:stroke-[2]">
              {label}
            </span>
          ) : (
            <>
              {showLeadingIcon && (
                <LeadingIcon
                  size={iconSize}
                  strokeWidth={1.5}
                  className="transition-[stroke-width] duration-80 group-hover:stroke-[2]"
                />
              )}
              {showLeadingIconNode && icon}
              <span className="[text-box:trim-both_cap_alphabetic]">{label}</span>
              {showTrailingIcon && (hasIconNode ? icon : trailingIconIdle)}
            </>
          )}
        </span>
      </>
    );

    const rootClassName = cn(
      buttonVariants({
        variant: resolvedVariant,
        size: resolvedSize,
        iconLeft: !isIconOnly && (showLeadingIcon || showLeadingIconNode),
        iconRight: !isIconOnly && showTrailingIcon,
      }),
      shape.button,
      isLinkVariant && 'underline-offset-4 hover:underline',
      className,
    );

    if (to) {
      return (
        <UiLink
          ref={ref as React.Ref<HTMLAnchorElement>}
          to={to}
          className={rootClassName}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          style={style}
          onClick={(event) => {
            if (disabled) {
              event.preventDefault();
              return;
            }
            props.onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
          }}
        >
          {internals}
        </UiLink>
      );
    }

    if (asChildElement) {
      const childProps = asChildElement.props;
      return cloneElement(
        asChildElement,
        {
          ...props,
          ref,
          className: cn(rootClassName, childProps.className),
          style: { ...style, ...childProps.style },
        },
        internals,
      );
    }

    return (
      <ButtonPrimitive
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={rootClassName}
        disabled={disabled || loading}
        style={style}
        {...props}
      >
        {internals}
      </ButtonPrimitive>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
