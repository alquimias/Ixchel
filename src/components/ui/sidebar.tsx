'use client';

/* eslint-disable @typescript-eslint/no-unused-vars -- FF sidebar shell */

import {
  useEffect,
  useRef,
  forwardRef,
  type ReactNode,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { spring, exitFallbackMs } from '../../lib/springs';
import { useSurface, SurfaceProvider } from '../../lib/surface-context';
import { surfaceClasses } from '../../lib/surface-classes';
import {
  useSidebar,
  SidebarShell,
  type SidebarSide,
  type SidebarVariant,
  type SidebarCollapsible,
} from './sidebar-core';

// ─── Mobile sheet ────────────────────────────────────────────────────────────
//
// Built on Base UI Dialog rather than Base UI Drawer: Drawer's
// swipe-to-dismiss writes inline `transform` + `--drawer-swipe-movement-*`
// CSS vars onto its Popup and expects CSS-transition choreography (plus a
// mandatory <Drawer.Viewport>), which fights framer-motion's transform
// management on the same element. Dialog provides everything we actually
// need — scroll lock, focus trap, focus restore, Esc + outside-click
// dismissal — while leaving the slide animation to framer-motion.

// Props framer-motion redefines with incompatible signatures; they must not
// be forwarded from Base UI's render-prop payload onto a motion.div.
type MotionSafeDivProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>;

interface SidebarSheetProps {
  side: SidebarSide;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

function SidebarSheet({ side, open, onClose, children }: SidebarSheetProps) {
  const { widthMobile } = useSidebar();
  const substrate = useSurface();
  const level = Math.min(substrate + 2, 8);

  // With `actionsRef` set, Base UI defers unmounting the portal on close
  // until `actionsRef.current.unmount()` is called, letting the framer-motion
  // exit tween below play out first.
  const actionsRef = useRef<DialogPrimitive.Root.Actions | null>(null);

  // Fallback release for the deferred unmount: onAnimationComplete on the
  // panel is the primary signal, but rAF-driven animation callbacks can stall
  // in throttled/background tabs.
  useEffect(() => {
    if (open) return;
    const id = setTimeout(() => actionsRef.current?.unmount(), exitFallbackMs(spring.moderate));
    return () => clearTimeout(id);
  }, [open]);

  const offscreen = side === 'left' ? '-100%' : '100%';

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      actionsRef={actionsRef}
    >
      <DialogPrimitive.Portal>
        {/* Scrim: an always-on bg-black/40 base that stays visible for
            system-dark users (`dark:` only matches the explicit .dark class),
            boosted to /80 in explicit dark mode. */}
        <DialogPrimitive.Backdrop
          render={(backdropProps) => {
            const { style: _style, ...rest } =
              backdropProps as React.HTMLAttributes<HTMLDivElement>;
            return (
              <motion.div
                {...(rest as MotionSafeDivProps)}
                className="fixed inset-0 bg-black/40 dark:bg-black/80 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: open ? 1 : 0 }}
                transition={open ? { duration: 0.16 } : spring.moderate.exit}
              />
            );
          }}
        />

        <DialogPrimitive.Popup
          aria-label="Sidebar"
          render={(popupProps) => {
            const { style: baseStyle, ...rest } =
              popupProps as React.HTMLAttributes<HTMLDivElement>;
            return (
              <motion.div
                {...(rest as MotionSafeDivProps)}
                data-sidebar="sidebar"
                data-mobile="true"
                data-side={side}
                className={cn(
                  'fixed inset-y-0 z-50 flex flex-col overflow-hidden',
                  side === 'left' ? 'left-0' : 'right-0',
                  surfaceClasses(level, 3),
                )}
                style={{
                  ...(baseStyle as CSSProperties | undefined),
                  width: widthMobile,
                }}
                initial={{ x: offscreen }}
                // spring.moderate: critically damped, so the panel decelerates
                // into x: 0 without overshooting and exposing the page behind
                // its leading edge.
                animate={{ x: open ? 0 : offscreen }}
                transition={open ? spring.moderate : spring.moderate.exit}
                onAnimationComplete={() => {
                  if (!open) actionsRef.current?.unmount();
                }}
              >
                <SurfaceProvider value={level}>{children}</SurfaceProvider>
              </motion.div>
            );
          }}
        />
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export interface SidebarProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
> {
  side?: SidebarSide;
  variant?: SidebarVariant;
  collapsible?: SidebarCollapsible;
  /** The `sidebar` variant's inner-edge border. Default true. */
  bordered?: boolean;
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      side = 'left',
      variant = 'sidebar',
      collapsible = 'offcanvas',
      bordered = true,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { isMobile, openMobile, setOpenMobile, width, registerSide } = useSidebar();

    // The provider mirrors the side into the default shortcut ("[" / "]")
    // and the rail handle.
    useEffect(() => registerSide(side), [side, registerSide]);

    if (collapsible === 'none') {
      return (
        <div
          ref={ref}
          data-slot="sidebar"
          data-variant={variant}
          data-side={side}
          className={cn(
            'peer sticky top-0 flex h-svh shrink-0 flex-col',
            side === 'right' && 'order-last',
            className,
          )}
          style={{ width, ...style } as CSSProperties}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className={cn(
              'flex h-full w-full min-h-0 flex-col',
              bordered &&
                variant === 'sidebar' &&
                (side === 'left' ? 'border-r border-border' : 'border-l border-border'),
            )}
          >
            {children}
          </div>
        </div>
      );
    }

    if (isMobile) {
      return (
        <SidebarSheet side={side} open={openMobile} onClose={() => setOpenMobile(false)}>
          {children}
        </SidebarSheet>
      );
    }

    return (
      <SidebarShell
        ref={ref}
        side={side}
        variant={variant}
        bordered={bordered}
        collapsible={collapsible === 'icon' ? 'icon' : 'offcanvas'}
        className={className}
        style={style}
        {...props}
      >
        {children}
      </SidebarShell>
    );
  },
);
Sidebar.displayName = 'Sidebar';

// ─── SidebarContent ──────────────────────────────────────────────────────────

export interface SidebarContentProps extends HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string;
}

const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, viewportClassName, children, ...props }, ref) => {
    // Clip wrapper: Linux/GTK classic scrollbars still eat ~12–16px even
    // with scrollbar-width:none, which shifts the 3rem icon rail off the
    // status-bar tenant rule. Park the bar in a negative-margin strip the
    // parent clips away so wheel-scroll still works.
    return (
      <div
        data-slot="sidebar-content-clip"
        className={cn('flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden', className)}
      >
        <div
          ref={ref}
          data-sidebar="content"
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain',
            '[scrollbar-width:none] [-ms-overflow-style:none]',
            '-mr-5 pr-5',
            viewportClassName,
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
);
SidebarContent.displayName = 'SidebarContent';

export { Sidebar, SidebarContent };

// Re-export the flavor-neutral parts so `sidebar` is a one-stop import.
export {
  SidebarProvider,
  useSidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarInput,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SIDEBAR_COOKIE_NAME,
  SIDEBAR_COOKIE_MAX_AGE,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_MOBILE,
  SIDEBAR_WIDTH_ICON,
  SIDEBAR_KEYBOARD_SHORTCUT,
  SIDEBAR_KEYBOARD_SHORTCUT_RIGHT,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_MAX_WIDTH,
} from './sidebar-core';
export type {
  SidebarContextValue,
  SidebarProviderProps,
  SidebarTriggerProps,
  SidebarRailProps,
  SidebarInsetProps,
  SidebarInputProps,
  SidebarSectionProps,
  SidebarGroupLabelProps,
  SidebarGroupActionProps,
  SidebarSide,
  SidebarVariant,
  SidebarCollapsible,
} from './sidebar-core';
export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  sidebarMenuButtonVariants,
} from './sidebar-menu';
export type {
  SidebarMenuProps,
  SidebarMenuItemProps,
  SidebarMenuButtonProps,
  SidebarMenuActionProps,
  SidebarMenuBadgeProps,
  SidebarMenuSkeletonProps,
  SidebarMenuSubProps,
  SidebarMenuSubItemProps,
  SidebarMenuSubButtonProps,
} from './sidebar-menu';
