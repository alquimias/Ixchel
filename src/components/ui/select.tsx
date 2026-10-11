'use client';

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  createContext,
  useContext,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import type { IconComponent } from '../../lib/icon-context';
import {
  formFieldErrorClassName,
  formFieldLabelClassName,
  formFieldLabelStyle,
  formFieldStackClassName,
} from '../../lib/form-field-styles';
import { cn } from '../../lib/utils';
import { spring, exitFallbackMs } from '../../lib/springs';
import { useProximityHover } from '../../hooks/use-proximity-hover';
import { useInputErrorShake } from '../../hooks/use-input-error-shake';
import { useShape } from '../../lib/shape-context';
import { Elevated } from '../../lib/elevated';
import { usePortalContainer } from '../../lib/portal-container-context';

// ---------------------------------------------------------------------------
// Select context
//
// Built on Base UI's Select primitive, which owns positioning (collision
// flipping, anchor tracking), dismissal (outside press, focus-out, Escape
// nesting inside dialogs), list keyboard navigation + typeahead, combobox
// ARIA, and the hidden form input. This layer keeps the
// proximity-hover overlays, the spring open/close animation (via actionsRef
// deferred unmount), and the animated checkmark.
// ---------------------------------------------------------------------------

// How long a selection holds the popup open before closing, so the
// acknowledgment — the checkmark drawing in and the selected background
// springing to the picked row — is visible instead of being cut off by the
// ~60ms close fade. Escape and outside presses still close immediately.
const selectionAckMs = 300;

interface SelectContextValue {
  value: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  actionsRef: React.RefObject<{ unmount: () => void } | null>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchable: boolean;
  setSearchable: (searchable: boolean | undefined) => void;
  typeaheadInputRef: React.RefObject<HTMLInputElement | null>;
  contentContainerRef: React.RefObject<HTMLDivElement | null>;
  listNavigationActive: boolean;
  setListNavigationActive: (active: boolean) => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('Select compound components must be inside <Select>');
  return ctx;
}

// Content context for proximity hover
interface SelectContentContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
  activeIndex: number | null;
  checkedIndex?: number;
}

const SelectContentContext = createContext<SelectContentContextValue | null>(null);

// ---------------------------------------------------------------------------
// Select (root)
// ---------------------------------------------------------------------------

interface SelectProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}

/**
 * Recursively flattens a ReactNode into its rendered text, e.g. the
 * `<span title="…">{nombre}</span>` wrapper some SelectItems use to add a
 * tooltip/truncation around the label. Elements with no extractable text
 * (icons, etc.) contribute nothing.
 */
function extractText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (isValidElement(node)) {
    const children = (node.props as { children?: ReactNode }).children;
    return children ? extractText(children) : '';
  }
  return '';
}

/**
 * Walk the children tree collecting `{ value, label }` pairs from SelectItem
 * elements. Passed to Base UI's `items` prop so the trigger can resolve the
 * label of an initial value before the popup has ever mounted (items only
 * render while open). Labels with no extractable text fall back to the raw
 * value, matching the previous labelMap behaviour.
 */
function collectSelectItems(node: ReactNode, out: { value: string; label: ReactNode }[] = []) {
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as { value?: unknown; children?: ReactNode };
    if (typeof props.value === 'string') {
      const text = extractText(props.children);
      out.push({
        value: props.value,
        label: text || props.value,
      });
    } else if (props.children) {
      collectSelectItems(props.children, out);
    }
  });
  return out;
}

/**
 * Enfoca el input de búsqueda del select sin dejar que Base UI lo cierre.
 *
 * El input vive como hermano del trigger (para ocuparlo visualmente), fuera
 * del árbol que Base UI reconoce como propio del select (trigger + popover).
 * Al enfocarlo, el trigger dispara un `focusout` cuyo `relatedTarget` Base UI
 * no reconoce, y lo interpreta como "el foco salió del select" -- cerrándolo
 * de inmediato (ver `FloatingFocusManager`, `movedToUnrelatedNode`). Ese
 * `focusout` se dispara de forma síncrona dentro de `.focus()` -- antes de
 * que la llamada retorne --, así que un listener de captura en `document`
 * (que corre antes que el listener de Base UI, colocado directo sobre el
 * botón del trigger en fase de burbuja) puede interceptarlo y detener su
 * propagación sin tocar el internals de la librería ni afectar ningún otro
 * caso de uso del componente. El listener se retira justo después de
 * `.focus()`, nunca con `{ once: true }`: si esa llamada no dispara ningún
 * `focusout` (p. ej. el input ya tenía el foco), un listener `once` se queda
 * armado indefinidamente y termina devorando el próximo `focusout` real de
 * cualquier parte de la página -- por ejemplo el que Base UI necesita para
 * procesar el click sobre una opción, bloqueando la selección por completo.
 */
function focusTypeaheadInput(input: HTMLInputElement | null) {
  if (!input) return;
  const swallowFocusOut = (event: FocusEvent) => event.stopPropagation();
  document.addEventListener('focusout', swallowFocusOut, { capture: true });
  input.focus({ preventScroll: true });
  document.removeEventListener('focusout', swallowFocusOut, { capture: true });
}

const searchableItemThreshold = 6;

function hasRenderableChildren(node: ReactNode): boolean {
  let found = false;
  Children.forEach(node, (child) => {
    if (child != null && child !== false) found = true;
  });
  return found;
}

function itemMatchesSearch(
  props: SelectItemProps,
  normalizedQuery: string,
  currentValue: string,
): boolean {
  if (!normalizedQuery) return true;
  if (props.value === currentValue) return true;
  const text = extractText(props.children).toLowerCase();
  return text.includes(normalizedQuery) || props.value.toLowerCase().includes(normalizedQuery);
}

function filterSelectChildren(
  node: ReactNode,
  normalizedQuery: string,
  currentValue: string,
): ReactNode {
  if (!normalizedQuery) return node;

  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child;

    if (child.type === SelectItem) {
      const props = child.props as SelectItemProps;
      return itemMatchesSearch(props, normalizedQuery, currentValue) ? child : null;
    }

    const nested = (child.props as { children?: ReactNode }).children;
    if (nested) {
      const filtered = filterSelectChildren(nested, normalizedQuery, currentValue);
      if (!hasRenderableChildren(filtered)) return null;
      return cloneElement(child, {}, filtered);
    }

    return child;
  });
}

function Select({
  children,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  name,
  required,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchableOverride, setSearchable] = useState<boolean | undefined>(undefined);
  const [listNavigationActive, setListNavigationActive] = useState(false);
  const actionsRef = useRef<{ unmount: () => void } | null>(null);
  const typeaheadInputRef = useRef<HTMLInputElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const currentValue = value !== undefined ? value : internalValue;

  const items = useMemo(() => collectSelectItems(children), [children]);
  const isSearchable = searchableOverride ?? items.length > searchableItemThreshold;

  const resetTypeahead = useCallback(() => {
    setSearchQuery('');
    setListNavigationActive(false);
  }, []);

  const handleValueChange = useCallback(
    (next: string | null) => {
      const v = next ?? '';
      // Base UI puede emitir null al abrir un select controlado cuyo valor
      // aún no está registrado en `items`; ignorarlo evita limpiar filtros URL.
      if (value !== undefined && v === '' && value !== '') {
        return;
      }
      if (value === undefined) setInternalValue(v);
      onValueChange?.(v);
    },
    [value, onValueChange],
  );

  const ackTimeoutRef = useRef<number | null>(null);
  const cancelAckClose = useCallback(() => {
    if (ackTimeoutRef.current !== null) {
      clearTimeout(ackTimeoutRef.current);
      ackTimeoutRef.current = null;
    }
  }, []);
  useEffect(() => cancelAckClose, [cancelAckClose]);

  // Picking an item acknowledges before closing: the close is deferred by
  // selectionAckMs so the checkmark draw and the selected background's spring
  // to the picked row are seen. Every other close reason (Escape, outside
  // press, trigger toggle, focus-out) closes immediately and cancels any
  // pending acknowledgment; re-picking within the window restarts it.
  const handleOpenChange = useCallback(
    (nextOpen: boolean, eventDetails: { reason: string }) => {
      if (!nextOpen && eventDetails.reason === 'item-press') {
        cancelAckClose();
        ackTimeoutRef.current = window.setTimeout(() => {
          ackTimeoutRef.current = null;
          resetTypeahead();
          setOpen(false);
        }, selectionAckMs);
        return;
      }
      cancelAckClose();
      if (!nextOpen) {
        resetTypeahead();
      }
      setOpen(nextOpen);
    },
    [cancelAckClose, resetTypeahead],
  );

  const ctx = useMemo(
    () => ({
      value: currentValue,
      open,
      setOpen,
      actionsRef,
      searchQuery,
      setSearchQuery,
      isSearchable,
      setSearchable,
      typeaheadInputRef,
      contentContainerRef,
      listNavigationActive,
      setListNavigationActive,
    }),
    [currentValue, open, searchQuery, isSearchable, listNavigationActive],
  );

  return (
    <SelectContext.Provider value={ctx}>
      <SelectPrimitive.Root
        // Always controlled; "" (no selection) maps to Base UI's null.
        value={currentValue === '' ? null : currentValue}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={handleOpenChange}
        actionsRef={actionsRef}
        items={items}
        disabled={disabled}
        name={name}
        required={required}
        // Non-modal: the page keeps scrolling and the Positioner tracks the
        // anchor, so the popup follows its trigger instead of detaching.
        modal={false}
      >
        {children}
      </SelectPrimitive.Root>
    </SelectContext.Provider>
  );
}

Select.displayName = 'Select';

// ---------------------------------------------------------------------------
// Radix/shadcn compatibility (SelectValue child, auto-indexed SelectItem)
// ---------------------------------------------------------------------------

interface SelectValueProps {
  placeholder?: string;
}

function SelectValue() {
  return null;
}

SelectValue.displayName = 'SelectValue';

function resolveTriggerPlaceholder(
  explicitPlaceholder: string | undefined,
  children?: ReactNode,
): string {
  if (explicitPlaceholder) return explicitPlaceholder;

  let found = 'Select…';
  Children.forEach(children, (child) => {
    if (
      isValidElement(child) &&
      (child.type === SelectValue ||
        (child.type as { displayName?: string }).displayName === 'SelectValue')
    ) {
      const placeholder = (child.props as SelectValueProps).placeholder;
      if (placeholder) found = placeholder;
    }
  });
  return found;
}

function withIndexedSelectItems(children: ReactNode): ReactNode {
  let index = 0;

  const walk = (node: ReactNode): ReactNode =>
    Children.map(node, (child) => {
      if (!isValidElement(child)) return child;

      if (child.type === SelectItem) {
        const itemProps = child.props as SelectItemProps;
        const next = cloneElement(child, {
          index: itemProps.index ?? index,
        } as Partial<SelectItemProps>);
        index += 1;
        return next;
      }

      const nested = (child.props as { children?: ReactNode }).children;
      if (nested) {
        return cloneElement(child, {}, walk(nested));
      }

      return child;
    });

  return walk(children);
}

// ---------------------------------------------------------------------------
// SelectTrigger
// ---------------------------------------------------------------------------

const triggerVariants = cva(
  [
    'group inline-flex items-center justify-between gap-2 outline-none cursor-pointer',
    'text-[13px] h-9 px-3 min-w-[160px]',
    'transition-all duration-80',
    'disabled:opacity-50 disabled:pointer-events-none',
    'focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring,#6B97FF)]',
  ],
  {
    variants: {
      variant: {
        bordered: 'border border-border bg-transparent text-foreground hover:bg-hover',
        borderless: 'border border-transparent bg-transparent text-foreground hover:bg-hover',
      },
    },
    defaultVariants: {
      variant: 'bordered',
    },
  },
);

interface SelectTriggerProps
  extends
    Omit<HTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof triggerVariants> {
  icon?: IconComponent;
  placeholder?: string;
  label?: string;
  error?: string;
  children?: ReactNode;
}

function isPrintableKey(event: React.KeyboardEvent): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  (
    {
      className,
      variant,
      icon: Icon,
      placeholder,
      label,
      error,
      children,
      id,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const shape = useShape();
    const { isError, isShaking } = useInputErrorShake(error);
    const {
      open,
      setOpen,
      searchQuery,
      setSearchQuery,
      isSearchable,
      typeaheadInputRef,
      contentContainerRef,
      setListNavigationActive,
    } = useSelectContext();
    const resolvedPlaceholder = resolveTriggerPlaceholder(placeholder, children);
    const errorId = id && error ? `${id}-error` : undefined;
    const showTypeaheadInput = isSearchable && open;

    const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (!isSearchable || event.defaultPrevented || open) return;

      if (isPrintableKey(event)) {
        setSearchQuery(event.key);
        setOpen(true);
        event.preventDefault();
      }
    };

    const handleTypeaheadKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Backspace' && searchQuery === '') {
        return;
      }

      if (event.key === 'ArrowDown') {
        setListNavigationActive(true);
        const first =
          contentContainerRef.current?.querySelector<HTMLElement>('[data-proximity-index]');
        first?.focus();
        event.preventDefault();
        return;
      }

      if (event.key === 'Escape' && searchQuery) {
        setSearchQuery('');
        event.preventDefault();
        event.stopPropagation();
      }
    };

    return (
      <div
        className={cn(formFieldStackClassName, 't-input-wrap', isError && 'is-error')}
        data-select-root
      >
        {label ? (
          <label
            htmlFor={id}
            className={cn(formFieldLabelClassName, error && 'text-destructive')}
            style={formFieldLabelStyle}
          >
            {label}
          </label>
        ) : null}
        <div className="t-input-shake-track">
          <div className={cn('relative t-input', isError && 'is-error', isShaking && 'is-shaking')}>
            <SelectPrimitive.Trigger
              ref={ref}
              id={id}
              aria-invalid={!!error || undefined}
              aria-describedby={errorId ?? props['aria-describedby']}
              className={cn(
                triggerVariants({ variant }),
                shape.select,
                error && 'border-destructive/50 hover:border-destructive/50',
                className,
              )}
              onKeyDown={handleTriggerKeyDown}
              {...props}
            >
              <span className="flex items-center gap-2 min-w-0 flex-1">
                {Icon && (
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    className="shrink-0 text-muted-foreground transition-[color,stroke-width] duration-80 group-hover:text-foreground group-hover:stroke-[2]"
                  />
                )}
                {showTypeaheadInput ? (
                  <span
                    aria-hidden
                    className="min-w-0 flex-1 truncate [text-box:trim-both_cap_alphabetic] py-1 -my-1 invisible"
                  >
                    {searchQuery || resolvedPlaceholder}
                  </span>
                ) : (
                  <SelectPrimitive.Value
                    placeholder={resolvedPlaceholder}
                    className="min-w-0 flex-1 text-left truncate [text-box:trim-both_cap_alphabetic] py-1 -my-1 data-[placeholder]:text-muted-foreground"
                  />
                )}
              </span>

              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-muted-foreground transition-colors duration-80 group-hover:text-foreground"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </SelectPrimitive.Trigger>

            {showTypeaheadInput ? (
              <input
                ref={typeaheadInputRef}
                type="text"
                value={searchQuery}
                placeholder={searchQuery ? undefined : resolvedPlaceholder}
                aria-label={resolvedPlaceholder}
                className={cn(
                  'absolute inset-y-0 right-9 left-3 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground',
                  Icon && 'left-9',
                )}
                onChange={(event) => {
                  setListNavigationActive(false);
                  setSearchQuery(event.target.value);
                }}
                onKeyDown={handleTypeaheadKeyDown}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  setListNavigationActive(false);
                }}
              />
            ) : null}
          </div>
        </div>
        <span id={errorId} role="alert" className={cn(formFieldErrorClassName, 't-error-msg')}>
          {error ?? ''}
        </span>
      </div>
    );
  },
);

SelectTrigger.displayName = 'SelectTrigger';

// ---------------------------------------------------------------------------
// SelectContent
// ---------------------------------------------------------------------------

interface SelectContentProps {
  className?: string;
  children: ReactNode;
  /** Habilita filtrar escribiendo en el trigger. Por defecto con más de 6 opciones. */
  searchable?: boolean;
}

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, searchable }, ref) => {
    const {
      open,
      value,
      actionsRef,
      searchQuery,
      isSearchable,
      setSearchable,
      typeaheadInputRef,
      contentContainerRef,
      listNavigationActive,
    } = useSelectContext();
    const containerRef = contentContainerRef;
    const shape = useShape();
    const portalContainer = usePortalContainer();

    useEffect(() => {
      setSearchable(searchable);
      return () => setSearchable(undefined);
    }, [searchable, setSearchable]);

    const normalizedSearch = isSearchable ? searchQuery.trim().toLowerCase() : '';

    const filteredChildren = useMemo(
      () => filterSelectChildren(children, normalizedSearch, value),
      [children, normalizedSearch, value],
    );

    const indexedChildren = useMemo(
      () => withIndexedSelectItems(filteredChildren),
      [filteredChildren],
    );

    const visibleItemCount = useMemo(
      () => collectSelectItems(filteredChildren).length,
      [filteredChildren],
    );

    const {
      activeIndex,
      setActiveIndex,
      itemRects,
      isMeasured,
      handlers,
      registerItem,
      remeasure,
    } = useProximityHover(containerRef);

    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [checkedIndex, setCheckedIndex] = useState<number | undefined>(undefined);

    // Release Base UI's deferred unmount once the exit tween has played.
    // onAnimationComplete on the motion.div is the primary signal; this
    // timeout is a fallback for throttled/background tabs where rAF-driven
    // animation callbacks can stall. The popup exits with spring.fast, so the
    // fallback tracks that tier's exit duration plus a safety buffer.
    useEffect(() => {
      if (open) return;
      const id = setTimeout(() => actionsRef.current?.unmount(), exitFallbackMs(spring.fast));
      return () => clearTimeout(id);
    }, [open, actionsRef]);

    // Fresh rects once per open. Measuring is the hook's job — it owns the
    // one coalesced pass that item registration and container resizes both
    // feed into, and a second pass from elsewhere is what used to land a
    // corrected rect on an already-mounted overlay. The popup keeps its items
    // registered while it sits hidden between opens, so registration alone
    // would never trigger a fresh pass on reopen.
    useEffect(() => {
      if (!open) return;
      remeasure();
    }, [open, remeasure]);

    // Detect the checked row. Deliberately does NOT remeasure on a value
    // change while open: the rows haven't moved, so the published rects stay
    // trustworthy and only checkedIndex switches — which lets the selected
    // marker spring from the old row to the picked one (the selection
    // acknowledgment) instead of unmounting and snapping.
    useEffect(() => {
      if (!open) return;
      // Double rAF: first waits for React commit, second for layout
      let inner: number;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => {
          const container = containerRef.current;
          if (container) {
            const items = Array.from(
              container.querySelectorAll('[data-proximity-index]'),
            ) as HTMLElement[];
            const idx = items.findIndex((el) => el.getAttribute('data-value') === value);
            setCheckedIndex(idx !== -1 ? idx : undefined);
          }
        });
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }, [open, value, containerRef]);

    useEffect(() => {
      if (!open || !isSearchable || listNavigationActive) return;

      let inner: number;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => {
          focusTypeaheadInput(typeaheadInputRef.current);
        });
      });

      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }, [open, isSearchable, listNavigationActive, typeaheadInputRef]);

    // Reset every overlay index as the close begins. checkedIndex otherwise
    // lags one open behind value (picking an item closes the popup before the
    // effect above re-syncs it), and a leftover activeIndex is worse: Base UI
    // keeps the popup mounted through the exit tween, so on reopen the hover
    // pill would still be sitting on the previously active row and spring from
    // there to the row that auto-focus lands on.
    useEffect(() => {
      if (open) return;
      const frame = requestAnimationFrame(() => {
        setCheckedIndex(undefined);
        setActiveIndex(null);
        setFocusedIndex(null);
      });
      return () => cancelAnimationFrame(frame);
    }, [open, setActiveIndex]);

    // Overlays read rects only once the hook reports the item set fully
    // measured. Positioning one from an incomplete pass mounts it at the wrong
    // row, and the correcting pass then springs it across the list.
    const activeRect = isMeasured && activeIndex !== null ? itemRects[activeIndex] : null;
    const checkedRect = isMeasured && checkedIndex != null ? itemRects[checkedIndex] : null;
    const focusRect = isMeasured && focusedIndex !== null ? itemRects[focusedIndex] : null;

    const contentCtx = useMemo(
      () => ({ registerItem, activeIndex, checkedIndex }),
      [registerItem, activeIndex, checkedIndex],
    );

    return (
      <SelectPrimitive.Portal container={portalContainer}>
        <SelectPrimitive.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          alignItemWithTrigger={false}
          className="z-50 pointer-events-auto outline-none"
        >
          <motion.div
            initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
            animate={open ? { opacity: 1, y: 0, scaleY: 1 } : { opacity: 0, y: -4, scaleY: 0.96 }}
            transition={open ? spring.fast : spring.fast.exit}
            style={{ transformOrigin: 'top center' }}
            // Base UI defers unmount while actionsRef is set; release it once
            // the exit spring has finished so the close animation fully plays.
            onAnimationComplete={() => {
              if (!open) actionsRef.current?.unmount();
            }}
          >
            <SelectContentContext.Provider value={contentCtx}>
              <SelectPrimitive.Popup
                render={
                  <Elevated
                    offset={2}
                    shadowLevel={3}
                    className="border border-border bg-popover text-popover-foreground"
                    ref={(node: HTMLDivElement | null) => {
                      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current =
                        node;
                      if (typeof ref === 'function') ref(node);
                      else if (ref)
                        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
                    }}
                  />
                }
                onFocusCapture={(event) => {
                  if (!isSearchable || listNavigationActive) return;

                  const target = event.target as HTMLElement;
                  if (target.closest('[data-proximity-index]')) {
                    requestAnimationFrame(() => {
                      focusTypeaheadInput(typeaheadInputRef.current);
                    });
                  }
                }}
                onMouseEnter={() => {
                  handlers.onMouseEnter();
                  setFocusedIndex(null);
                }}
                onMouseMove={handlers.onMouseMove}
                onMouseLeave={handlers.onMouseLeave}
                onFocus={(e) => {
                  const indexAttr = (e.target as HTMLElement)
                    .closest('[data-proximity-index]')
                    ?.getAttribute('data-proximity-index');
                  if (indexAttr != null) {
                    const idx = Number(indexAttr);
                    setActiveIndex(idx);
                    setFocusedIndex(
                      (e.target as HTMLElement).matches(':focus-visible') ? idx : null,
                    );
                  }
                }}
                onBlur={(e) => {
                  if (containerRef.current?.contains(e.relatedTarget as Node)) return;
                  setFocusedIndex(null);
                  setActiveIndex(null);
                }}
                className={cn(
                  // min-w tracks the trigger via the Positioner's --anchor-width
                  // var, matching the pre-migration minWidth: triggerRect.width.
                  `relative flex flex-col min-w-[var(--anchor-width)] max-h-[min(300px,var(--available-height))] ${shape.select} p-1 select-none outline-none`,
                  className,
                )}
              >
                <div className="relative flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {/* The three overlays are torn down as the close begins rather
                    than exit-animated, because an overlay still mounted when the
                    popup reopens is one AnimatePresence re-adopts under its old
                    key: `initial` never runs again, so it keeps the position of the
                    row it had before and animates from there to the new one. The
                    popup's own fade covers their disappearance. */}
                  {/* Selected background */}
                  {open && (
                    <AnimatePresence>
                      {checkedRect && (
                        <motion.div
                          className={`absolute ${shape.select} bg-active pointer-events-none`}
                          // Position lives in `animate` so an in-session value
                          // change springs the marker to the picked row (the
                          // selection acknowledgment). Safe against the reopen
                          // slide: the `open &&` teardown means no marker
                          // survives a close, and a fresh mount with
                          // initial={false} renders snapped at these values.
                          initial={false}
                          animate={{
                            top: checkedRect.top,
                            left: checkedRect.left,
                            width: checkedRect.width,
                            height: checkedRect.height,
                            opacity: 1,
                          }}
                          exit={{ opacity: 0, transition: spring.moderate.exit }}
                          transition={{
                            ...spring.moderate,
                            opacity: { duration: 0.08 },
                          }}
                        />
                      )}
                    </AnimatePresence>
                  )}

                  {/* Hover background */}
                  {open && (
                    <AnimatePresence>
                      {activeRect && (
                        <motion.div
                          className={`absolute ${shape.select} bg-hover pointer-events-none`}
                          initial={{
                            opacity: 0,
                            top: activeRect.top,
                            left: activeRect.left,
                            width: activeRect.width,
                            height: activeRect.height,
                          }}
                          animate={{
                            opacity: 1,
                            top: activeRect.top,
                            left: activeRect.left,
                            width: activeRect.width,
                            height: activeRect.height,
                          }}
                          exit={{ opacity: 0, transition: spring.fast.exit }}
                          transition={{
                            ...spring.fast,
                            opacity: { duration: 0.08 },
                          }}
                        />
                      )}
                    </AnimatePresence>
                  )}

                  {/* Focus ring */}
                  {open && (
                    <AnimatePresence>
                      {focusRect && (
                        <motion.div
                          className="absolute rounded-[10px] pointer-events-none z-20 border border-[color:var(--focus-ring,#6B97FF)]"
                          initial={false}
                          animate={{
                            left: focusRect.left - 2,
                            top: focusRect.top - 2,
                            width: focusRect.width + 4,
                            height: focusRect.height + 4,
                          }}
                          exit={{ opacity: 0, transition: spring.fast.exit }}
                          transition={{
                            ...spring.fast,
                            opacity: { duration: 0.08 },
                          }}
                        />
                      )}
                    </AnimatePresence>
                  )}

                  {indexedChildren}

                  {isSearchable && normalizedSearch && visibleItemCount === 0 ? (
                    <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                      No se encontraron opciones.
                    </p>
                  ) : null}
                </div>
              </SelectPrimitive.Popup>
            </SelectContentContext.Provider>
          </motion.div>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    );
  },
);

SelectContent.displayName = 'SelectContent';

// ---------------------------------------------------------------------------
// SelectItem
// ---------------------------------------------------------------------------

interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
  icon?: IconComponent;
  index?: number;
  value: string;
  disabled?: boolean;
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, icon: Icon, value, index, disabled = false, ...props }, ref) => {
    const selectCtx = useSelectContext();
    const contentCtx = useContext(SelectContentContext);
    const internalRef = useRef<HTMLDivElement>(null);
    const shape = useShape();

    // Register with proximity hover. Depends on the (stable) registerItem
    // rather than the content context, which is rebuilt on every activeIndex
    // change: keying the effect to the whole context re-ran it per mousemove,
    // unregistering and re-registering every row and so keeping the hook's
    // measurement permanently unsettled while the pointer moved.
    const registerItem = contentCtx?.registerItem;
    useEffect(() => {
      if (!registerItem || index === undefined) return;
      registerItem(index, internalRef.current);
      return () => registerItem(index, null);
    }, [index, registerItem]);

    const isActive = contentCtx?.activeIndex === index;
    const isChecked = selectCtx.value === value;

    return (
      <SelectPrimitive.Item
        value={value}
        disabled={disabled}
        label={typeof children === 'string' ? children : undefined}
        render={
          <div
            ref={(node: HTMLDivElement | null) => {
              (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }}
            data-proximity-index={index}
            data-value={value}
            className={cn(
              // Fixed height (was py-2 around a 19.5px line box ≈ 35.5px) so
              // the text-box trim on the item text doesn't shrink the row.
              // shrink-0: the popup is a max-height flex column, so without it
              // a long list compresses rows to fit instead of scrolling.
              `relative z-10 flex h-9 shrink-0 items-center gap-2 ${shape.select} px-2 text-[13px] cursor-pointer outline-none select-none`,
              'transition-[color] duration-80',
              isActive || isChecked ? 'text-foreground' : 'text-muted-foreground',
              disabled && 'opacity-50 pointer-events-none',
              className,
            )}
            {...props}
          />
        }
      >
        {Icon && (
          <Icon
            size={16}
            strokeWidth={isActive || isChecked ? 2 : 1.5}
            className="shrink-0 transition-[color,stroke-width] duration-80"
          />
        )}

        <SelectPrimitive.ItemText
          // py-1/-my-1 keeps truncate's overflow:hidden from clipping
          // ascenders/descenders outside the trimmed box.
          render={
            <span className="flex-1 min-w-0 truncate [text-box:trim-both_cap_alphabetic] py-1 -my-1" />
          }
        >
          {children}
        </SelectPrimitive.ItemText>

        {/* Always-rendered fixed slot so the check appearing/disappearing
            never changes the row's intrinsic width — without it the whole
            popup resizes when a selection lands. */}
        <span aria-hidden className="shrink-0 w-4 h-4">
          <AnimatePresence>
            {isChecked && (
              <motion.svg
                key="check"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
              >
                <motion.path
                  d="M4 12L9 17L20 6"
                  initial={{ pathLength: 0 }}
                  animate={{
                    pathLength: 1,
                    transition: { duration: 0.08, ease: 'easeOut' },
                  }}
                  exit={{
                    pathLength: 0,
                    transition: { duration: 0.04, ease: 'easeIn' },
                  }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </span>
      </SelectPrimitive.Item>
    );
  },
);

SelectItem.displayName = 'SelectItem';

// ---------------------------------------------------------------------------
// SelectGroup + SelectLabel + SelectSeparator
// ---------------------------------------------------------------------------

function SelectGroup({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="group" className={className} {...props}>
      {children}
    </div>
  );
}

SelectGroup.displayName = 'SelectGroup';

const SelectLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-2 py-1.5 shrink-0 text-[11px] text-muted-foreground', className)}
      {...props}
    />
  ),
);

SelectLabel.displayName = 'SelectLabel';

const SelectSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={cn('my-1 -mx-1 h-px shrink-0 bg-border/60', className)}
      {...props}
    />
  ),
);

SelectSeparator.displayName = 'SelectSeparator';

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectValue,
  triggerVariants,
};

export type { SelectProps, SelectTriggerProps, SelectContentProps, SelectItemProps };
