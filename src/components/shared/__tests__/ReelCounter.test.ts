import { describe, expect, it } from 'vitest';
import { tokenizeReelText } from '../ReelCounter';

describe('tokenizeReelText', () => {
  it('separa dígitos de separadores estáticos', () => {
    expect(tokenizeReelText('12,35')).toEqual([
      { kind: 'digit', value: 1, key: '0-1' },
      { kind: 'digit', value: 2, key: '1-2' },
      { kind: 'static', value: ',', key: '2-,' },
      { kind: 'digit', value: 3, key: '3-3' },
      { kind: 'digit', value: 5, key: '4-5' },
    ]);
  });

  it('trata puntos y guiones como estáticos', () => {
    expect(tokenizeReelText('1.234')).toEqual([
      { kind: 'digit', value: 1, key: '0-1' },
      { kind: 'static', value: '.', key: '1-.' },
      { kind: 'digit', value: 2, key: '2-2' },
      { kind: 'digit', value: 3, key: '3-3' },
      { kind: 'digit', value: 4, key: '4-4' },
    ]);
  });
});
