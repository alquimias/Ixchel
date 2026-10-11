import type { CSSProperties } from 'react';
import type { DotMatrixCommonProps } from '../../lib/dotmatrix-core';

/** Defaults from DialKit "Loader Playground" preset. */
export const pageTransitionLoaderDefaults = {
  size: 132,
  dotSize: 7,
  speed: 1.3,
  colorPreset: 'solid-theme',
  color: '#f4f4f5',
  pattern: 'full',
  dotShape: 'square',
  animated: true,
  hoverAnimated: false,
  muted: false,
  bloom: true,
  halo: 0,
  opacityBase: 0.3,
  opacityMid: 0.42,
  opacityPeak: 1,
  cellPadding: 6,
  boxSize: 10,
  minSize: 60,
  previewZoom: 1.55,
} as const satisfies DotMatrixCommonProps & { previewZoom: number };

export const pageTransitionLoaderThemeStyle = {
  '--color-dot-on': pageTransitionLoaderDefaults.color,
} as CSSProperties;
