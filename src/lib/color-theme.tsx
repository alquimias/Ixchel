'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from 'react';

export const BRAND_COLOR_KEYS = ['black', 'lavender', 'soft', 'peri', 'ghost'] as const;

export type BrandColorKey = (typeof BRAND_COLOR_KEYS)[number];

export type BrandColors = Record<BrandColorKey, string>;

/** Paleta por defecto (BYTE). Debe coincidir con `@theme` en `src/styles/theme.css`. */
export const DEFAULT_BRAND_COLORS: BrandColors = {
  black: '#000807',
  lavender: '#A2A3BB',
  soft: '#9395D3',
  peri: '#B3B7EE',
  ghost: '#FBF9FF',
};

export const BRAND_COLOR_CSS_VARS: Record<BrandColorKey, `--color-brand-${BrandColorKey}`> = {
  black: '--color-brand-black',
  lavender: '--color-brand-lavender',
  soft: '--color-brand-soft',
  peri: '--color-brand-peri',
  ghost: '--color-brand-ghost',
};

export function pickBrandColors(colors?: Partial<BrandColors>): Partial<BrandColors> {
  const next: Partial<BrandColors> = {};
  if (!colors) return next;
  for (const key of BRAND_COLOR_KEYS) {
    const value = colors[key];
    if (value) next[key] = value;
  }
  return next;
}

export function brandColorsToStyle(colors: Partial<BrandColors>): CSSProperties {
  const style: Record<string, string> = {};
  for (const key of BRAND_COLOR_KEYS) {
    const value = colors[key];
    if (value) style[BRAND_COLOR_CSS_VARS[key]] = value;
  }
  return style as CSSProperties;
}

export function applyBrandColors(element: HTMLElement, colors: Partial<BrandColors>): () => void {
  const applied: BrandColorKey[] = [];
  for (const key of BRAND_COLOR_KEYS) {
    const value = colors[key];
    if (!value) continue;
    element.style.setProperty(BRAND_COLOR_CSS_VARS[key], value);
    applied.push(key);
  }
  return () => {
    for (const key of applied) {
      element.style.removeProperty(BRAND_COLOR_CSS_VARS[key]);
    }
  };
}

interface ColorThemeContextValue {
  colors: BrandColors;
}

const ColorThemeContext = createContext<ColorThemeContextValue | null>(null);

export function useColorTheme(): BrandColors {
  const ctx = useContext(ColorThemeContext);
  return ctx?.colors ?? DEFAULT_BRAND_COLORS;
}

export function ColorThemeProvider({
  colors,
  children,
  scoped = false,
}: {
  colors?: Partial<BrandColors>;
  children: ReactNode;
  /**
   * Aplica las variables en un wrapper local (historias, demos anidados).
   * Sin esto, van a `document.documentElement` para que los portales
   * (Dialog, Select, Sheet) hereden el tema.
   */
  scoped?: boolean;
}) {
  const parent = useContext(ColorThemeContext);
  const black = colors?.black;
  const lavender = colors?.lavender;
  const soft = colors?.soft;
  const peri = colors?.peri;
  const ghost = colors?.ghost;

  const partial = useMemo(
    () => pickBrandColors({ black, lavender, soft, peri, ghost }),
    [black, lavender, soft, peri, ghost],
  );

  const resolved = useMemo(
    () => ({ ...DEFAULT_BRAND_COLORS, ...parent?.colors, ...partial }),
    [parent?.colors, partial],
  );

  const style = useMemo(() => brandColorsToStyle(partial), [partial]);

  useEffect(() => {
    if (scoped || Object.keys(partial).length === 0) return;
    return applyBrandColors(document.documentElement, partial);
  }, [scoped, partial]);

  const value = useMemo(() => ({ colors: resolved }), [resolved]);

  if (scoped) {
    return (
      <ColorThemeContext.Provider value={value}>
        <div data-ixchel-color-theme="" style={style}>
          {children}
        </div>
      </ColorThemeContext.Provider>
    );
  }

  return <ColorThemeContext.Provider value={value}>{children}</ColorThemeContext.Provider>;
}
