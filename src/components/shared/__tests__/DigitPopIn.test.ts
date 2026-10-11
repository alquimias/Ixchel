import { describe, expect, it } from 'vitest';
import { getDigitStaggerLevel } from '../DigitPopIn';

describe('getDigitStaggerLevel', () => {
  it('no aplica stagger antes del primer punto decimal', () => {
    expect(getDigitStaggerLevel(0, '12.3')).toBeUndefined();
    expect(getDigitStaggerLevel(1, '12.3')).toBeUndefined();
  });

  it('aplica stagger incremental desde el primer punto', () => {
    expect(getDigitStaggerLevel(2, '12.3')).toBe(1);
    expect(getDigitStaggerLevel(3, '12.3')).toBe(2);
  });

  it('soporta versiones semver con prefijo v', () => {
    expect(getDigitStaggerLevel(2, 'v1.18.0')).toBe(1);
    expect(getDigitStaggerLevel(5, 'v1.18.0')).toBe(4);
  });

  it('aplica stagger desde coma decimal en formato es-CO', () => {
    expect(getDigitStaggerLevel(2, '12,35')).toBe(1);
    expect(getDigitStaggerLevel(3, '12,35')).toBe(2);
  });

  it('usa el separador decimal derecho cuando hay miles y decimales', () => {
    expect(getDigitStaggerLevel(4, '1.234,56')).toBeUndefined();
    expect(getDigitStaggerLevel(5, '1.234,56')).toBe(1);
    expect(getDigitStaggerLevel(6, '1.234,56')).toBe(2);
  });

  it('devuelve undefined si no hay separador decimal', () => {
    expect(getDigitStaggerLevel(0, 'v1')).toBeUndefined();
    expect(getDigitStaggerLevel(1, 'v1')).toBeUndefined();
  });
});
