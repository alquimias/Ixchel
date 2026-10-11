'use client';

/* eslint-disable @typescript-eslint/no-unused-vars -- motion prop stripping */

import { createContext, useContext, useState, type ReactNode } from 'react';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { motion, useMotionValue } from 'framer-motion';
import { cn } from '../../lib/utils';
import { spring } from '../../lib/springs';
import { fontWeights } from '../../lib/font-weight';
import { useShape } from '../../lib/shape-context';

// ---------------------------------------------------------------------------
// Portal container context
// ---------------------------------------------------------------------------

const TooltipPortalContainerContext = createContext<HTMLElement | null>(null);

function TooltipPortalContainer({
  value,
  children,
}: {
  value: HTMLElement | null;
  children: ReactNode;
}) {
  return (
    <TooltipPortalContainerContext.Provider value={value}>
      {children}
    </TooltipPortalContainerContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const DEFAULT_DELAY = 200;

// Tracks whether an app-level <TooltipProvider> is above us. Each Tooltip
// only wraps itself in a local primitive Provider when there isn't one —
// a per-instance Provider would defeat cross-tooltip skip-delay grouping
// (moving between adjacent tooltips would re-wait the full delay).
const TooltipGroupContext = createContext(false);

interface TooltipProviderProps {
  children: ReactNode;
  /** Hover delay before tooltips open, in ms. Defaults to 200. */
  delayDuration?: number;
  /** After a tooltip closes, adjacent tooltips opened within this window
   *  skip the hover delay, in ms. Defaults to 300. */
  skipDelayDuration?: number;
}

/** Groups descendant Tooltips so that once one opens, moving to an adjacent
 *  trigger shows its tooltip instantly instead of re-waiting the full delay.
 *  Wrap once at the app (or section) level; bare Tooltips still work without
 *  it via a per-instance fallback. */
function TooltipProvider({
  children,
  delayDuration = DEFAULT_DELAY,
  skipDelayDuration = 300,
}: TooltipProviderProps) {
  return (
    <TooltipGroupContext.Provider value={true}>
      <TooltipPrimitive.Provider delay={delayDuration} timeout={skipDelayDuration}>
        {children}
      </TooltipPrimitive.Provider>
    </TooltipGroupContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  content: ReactNode;
  children: React.ReactElement;
  side?: TooltipSide;
  sideOffset?: number;
  /** Hover delay before this tooltip opens, in ms. Defaults to 200, or to the
   *  ambient TooltipProvider's delayDuration when one is present. */
  delayDuration?: number;
  className?: string;
  /** When true, forces the tooltip open. When false, forces it closed. When undefined, uses default hover/focus behavior. */
  forceOpen?: boolean;
  /** Follow the cursor along one axis while hovering the trigger — for tall
   *  or wide triggers (the Sidebar rail) where a centered tooltip sits far
   *  from the pointer. The other axis stays anchored by `side`. */
  followCursor?: 'x' | 'y';
  /** Called when the tooltip's internal open state changes (before forceOpen is applied). */
  onOpenChange?: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------

function getSlideOffset(side: TooltipSide) {
  switch (side) {
    case 'top':
      return { y: 4 };
    case 'bottom':
      return { y: -4 };
    case 'left':
      return { x: 4 };
    case 'right':
      return { x: -4 };
  }
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

function Tooltip({
  content,
  children,
  side = 'top',
  sideOffset = 8,
  delayDuration,
  className,
  forceOpen,
  onOpenChange: onOpenChangeProp,
  followCursor,
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = forceOpen !== undefined ? forceOpen : internalOpen;
  const shape = useShape();
  const portalContainer = useContext(TooltipPortalContainerContext);
  const hasAmbientProvider = useContext(TooltipGroupContext);

  const slideOffset = getSlideOffset(side);

  // Cursor-follow offset from the trigger's center, driven as a motion value
  // so per-move updates skip React re-renders.
  const followOffset = useMotionValue(0);
  const handleFollowMove = (event: React.PointerEvent) => {
    if (!followCursor) return;
    const rect = event.currentTarget.getBoundingClientRect();
    followOffset.set(
      followCursor === 'y'
        ? event.clientY - (rect.top + rect.height / 2)
        : event.clientX - (rect.left + rect.width / 2),
    );
  };

  const tooltip = (
    <TooltipPrimitive.Root
      open={open}
      onOpenChange={(v) => {
        setInternalOpen(v);
        onOpenChangeProp?.(v);
      }}
    >
      {/* An explicit delayDuration overrides the ambient provider's delay;
          left undefined, the trigger inherits it from the provider. */}
      <TooltipPrimitive.Trigger
        render={children}
        delay={delayDuration}
        onPointerMove={followCursor ? handleFollowMove : undefined}
      />
      <TooltipPrimitive.Portal container={portalContainer ?? undefined}>
        <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset} className="z-50">
          <TooltipPrimitive.Popup
            render={(props, state) => {
              const exiting = state.transitionStatus === 'ending';
              const contentChildren = content;
              const {
                style: baseStyle,
                // motion.div has incompatible drag/animation event signatures —
                // strip the React-DOM versions so they don't fight motion's own.
                onDrag: _onDrag,
                onDragStart: _onDragStart,
                onDragEnd: _onDragEnd,
                onAnimationStart: _onAnimationStart,
                onAnimationEnd: _onAnimationEnd,
                onAnimationIteration: _onAnimationIteration,
                ...rest
              } = props as React.HTMLAttributes<HTMLDivElement>;
              return (
                // Outer wrapper carries Base UI's popup props plus the
                // cursor-follow motion value; the inner box keeps the
                // enter/exit slide so the two transforms don't fight.
                <motion.div
                  {...rest}
                  style={{
                    ...(baseStyle as React.CSSProperties | undefined),
                    ...(followCursor === 'y'
                      ? { y: followOffset }
                      : followCursor === 'x'
                        ? { x: followOffset }
                        : {}),
                  }}
                >
                  <motion.div
                    className={cn(
                      // Trim recenters the label; the padding bump only applies
                      // where text-box is supported, keeping the same overall
                      // height (~26px) as untrimmed browsers.
                      'bg-foreground text-background text-[12px] px-2 py-1',
                      '[text-box:trim-both_cap_alphabetic] supports-[text-box:trim-both]:py-2',
                      shape.bg,
                      className,
                    )}
                    style={{ fontVariationSettings: fontWeights.medium }}
                    initial={{ opacity: 0, ...slideOffset }}
                    animate={exiting ? { opacity: 0, ...slideOffset } : { opacity: 1, x: 0, y: 0 }}
                    transition={exiting ? spring.fast.exit : spring.fast}
                  >
                    {contentChildren}
                  </motion.div>
                </motion.div>
              );
            }}
          />
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );

  // Fallback: without an ambient TooltipProvider, give this instance its own
  // so a bare <Tooltip> keeps the library's default delay. Grouped skip-delay
  // needs the shared app-level TooltipProvider.
  if (hasAmbientProvider) return tooltip;

  return (
    <TooltipPrimitive.Provider delay={delayDuration ?? DEFAULT_DELAY}>
      {tooltip}
    </TooltipPrimitive.Provider>
  );
}

export { Tooltip, TooltipPortalContainer, TooltipProvider as TooltipGroupProvider };
export type { TooltipProps, TooltipProviderProps, TooltipSide };

// Radix-style primitives para pantallas que usan TooltipTrigger/TooltipContent.
import * as React from 'react';
import { Tooltip as RadixTooltipPrimitive } from 'radix-ui';
import { cn as radixCn } from '../../lib/utils';

function LegacyTooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof RadixTooltipPrimitive.Provider>) {
  return <RadixTooltipPrimitive.Provider delayDuration={delayDuration} {...props} />;
}

const TooltipRoot = RadixTooltipPrimitive.Root;
const TooltipTrigger = RadixTooltipPrimitive.Trigger;

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof RadixTooltipPrimitive.Content>) {
  return (
    <RadixTooltipPrimitive.Portal>
      <RadixTooltipPrimitive.Content
        sideOffset={sideOffset}
        className={radixCn(
          // D-32/UI-32: bg-foreground/text-background en vez de
          // bg-primary/text-primary-foreground -- brand-soft es
          // demasiado claro para texto blanco encima (2.69:1, falla AA);
          // mismo par de alto contraste que ya usa el botón primary.
          'z-50 overflow-hidden rounded-md bg-foreground px-3 py-1.5 text-xs text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      >
        {children}
        <RadixTooltipPrimitive.Arrow className="fill-foreground" />
      </RadixTooltipPrimitive.Content>
    </RadixTooltipPrimitive.Portal>
  );
}

export { LegacyTooltipProvider as TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent };
