'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

type ShapeVariant = 'pill' | 'rounded';

interface ShapeClasses {
  item: string;
  bg: string;
  focusRing: string;
  mergedBg: string;
  container: string;
  button: string;
  input: string;
  select: string;
  /** Focus ring for controls sized like inputs (+2px over `input`). */
  inputFocusRing: string;
  bgRadius: number;
  mergedRadius: number;
  /** Pixel radius of `input` / `select` (rounded-md = 8px). */
  inputRadius: number;
}

const shapeMap: Record<ShapeVariant, ShapeClasses> = {
  pill: {
    item: 'rounded-[20px]',
    bg: 'rounded-[20px]',
    focusRing: 'rounded-[22px]',
    mergedBg: 'rounded-2xl',
    container: 'rounded-3xl',
    button: 'rounded-lg',
    input: 'rounded-md',
    select: 'rounded-md',
    inputFocusRing: 'rounded-[10px]',
    bgRadius: 20,
    mergedRadius: 16,
    inputRadius: 8,
  },
  rounded: {
    item: 'rounded-lg',
    bg: 'rounded-lg',
    focusRing: 'rounded-[10px]',
    mergedBg: 'rounded-lg',
    container: 'rounded-xl',
    button: 'rounded-lg',
    input: 'rounded-md',
    select: 'rounded-md',
    inputFocusRing: 'rounded-[10px]',
    bgRadius: 8,
    mergedRadius: 8,
    inputRadius: 8,
  },
};

interface ShapeContextValue {
  shape: ShapeVariant;
  setShape: (shape: ShapeVariant) => void;
  classes: ShapeClasses;
}

const ShapeContext = createContext<ShapeContextValue | null>(null);

function useShape(): ShapeClasses {
  const ctx = useContext(ShapeContext);
  if (!ctx) return shapeMap.pill;
  return ctx.classes;
}

function useShapeContext() {
  const ctx = useContext(ShapeContext);
  if (!ctx) throw new Error('useShapeContext must be used within a ShapeProvider');
  return ctx;
}

function ShapeProvider({
  children,
  defaultShape = 'pill',
}: {
  children: ReactNode;
  defaultShape?: ShapeVariant;
}) {
  const [shape, setShapeState] = useState<ShapeVariant>(defaultShape);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transitionShape = useCallback((callback: () => void) => {
    const root = document.documentElement;
    root.classList.add('transitioning');
    void root.offsetHeight;
    callback();
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => root.classList.remove('transitioning'), 200);
  }, []);

  const setShape = useCallback(
    (next: ShapeVariant) => {
      transitionShape(() => setShapeState(next));
    },
    [transitionShape],
  );

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--shape-input-radius',
      `${shapeMap[shape].inputRadius}px`,
    );
  }, [shape]);

  const value = useMemo(() => ({ shape, setShape, classes: shapeMap[shape] }), [shape, setShape]);

  return <ShapeContext.Provider value={value}>{children}</ShapeContext.Provider>;
}

export { ShapeProvider, useShape, useShapeContext, shapeMap };
export type { ShapeVariant, ShapeClasses };
