import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  applyBrandColors,
  brandColorsToStyle,
  BRAND_COLOR_CSS_VARS,
  ColorThemeProvider,
  DEFAULT_BRAND_COLORS,
  pickBrandColors,
  useColorTheme,
} from './color-theme';

describe('color-theme', () => {
  it('mapea solo las claves de marca presentes a variables CSS', () => {
    expect(pickBrandColors({ soft: '#ff0000', ghost: undefined })).toEqual({ soft: '#ff0000' });
    expect(brandColorsToStyle({ soft: '#2f6f4e' })).toEqual({
      [BRAND_COLOR_CSS_VARS.soft]: '#2f6f4e',
    });
  });

  it('aplica y limpia las variables en un elemento', () => {
    const node = document.createElement('div');
    const restore = applyBrandColors(node, { soft: '#1d6f9a', peri: '#7eb6d4' });

    expect(node.style.getPropertyValue('--color-brand-soft')).toBe('#1d6f9a');
    expect(node.style.getPropertyValue('--color-brand-peri')).toBe('#7eb6d4');
    expect(node.style.getPropertyValue('--color-brand-black')).toBe('');

    restore();
    expect(node.style.getPropertyValue('--color-brand-soft')).toBe('');
    expect(node.style.getPropertyValue('--color-brand-peri')).toBe('');
  });

  it('useColorTheme sin provider devuelve la paleta BYTE', () => {
    const { result } = renderHook(() => useColorTheme());
    expect(result.current).toEqual(DEFAULT_BRAND_COLORS);
  });

  it('el provider scoped escribe las variables en el wrapper', () => {
    render(
      <ColorThemeProvider scoped colors={{ soft: '#c45c26', black: '#1a100c' }}>
        <span>muestra</span>
      </ColorThemeProvider>,
    );

    const root = document.querySelector('[data-ixchel-color-theme]');
    expect(root).toBeInstanceOf(HTMLElement);
    expect((root as HTMLElement).style.getPropertyValue('--color-brand-soft')).toBe('#c45c26');
    expect((root as HTMLElement).style.getPropertyValue('--color-brand-black')).toBe('#1a100c');
    expect(screen.getByText('muestra')).toBeInTheDocument();
  });

  it('el provider global escribe en documentElement y restaura al desmontar', () => {
    const { unmount } = render(
      <ColorThemeProvider colors={{ soft: '#2f6f4e' }}>
        <span>app</span>
      </ColorThemeProvider>,
    );

    expect(document.documentElement.style.getPropertyValue('--color-brand-soft')).toBe('#2f6f4e');
    unmount();
    expect(document.documentElement.style.getPropertyValue('--color-brand-soft')).toBe('');
  });

  it('anida overrides sobre la paleta del padre', () => {
    function CurrentSoft() {
      const colors = useColorTheme();
      return <span>{colors.soft}</span>;
    }

    render(
      <ColorThemeProvider colors={{ soft: '#2f6f4e', peri: '#7cbc98' }}>
        <ColorThemeProvider scoped colors={{ soft: '#c45c26' }}>
          <CurrentSoft />
        </ColorThemeProvider>
      </ColorThemeProvider>,
    );

    expect(screen.getByText('#c45c26')).toBeInTheDocument();
  });
});
