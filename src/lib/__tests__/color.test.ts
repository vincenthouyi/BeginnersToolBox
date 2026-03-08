import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from '../color';

describe('hexToRgb', () => {
  it('parses a standard hex color', () => {
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
    expect(hexToRgb('#00ff00')).toEqual([0, 255, 0]);
    expect(hexToRgb('#0000ff')).toEqual([0, 0, 255]);
  });

  it('is case-insensitive', () => {
    expect(hexToRgb('#FF8800')).toEqual(hexToRgb('#ff8800'));
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('#zzz')).toBeNull();
    expect(hexToRgb('not-a-color')).toBeNull();
  });
});

describe('rgbToHex', () => {
  it('converts rgb to hex string', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
  });

  it('pads single digit hex channels', () => {
    expect(rgbToHex(1, 2, 3)).toBe('#010203');
  });
});

describe('rgbToHsl', () => {
  it('converts red', () => {
    expect(rgbToHsl(255, 0, 0)).toEqual([0, 100, 50]);
  });

  it('converts white', () => {
    expect(rgbToHsl(255, 255, 255)).toEqual([0, 0, 100]);
  });

  it('converts black', () => {
    expect(rgbToHsl(0, 0, 0)).toEqual([0, 0, 0]);
  });

  it('converts a mid-tone color', () => {
    const [h, s, l] = rgbToHsl(124, 106, 247);
    expect(h).toBeGreaterThan(200);
    expect(s).toBeGreaterThan(50);
    expect(l).toBeGreaterThan(50);
  });
});

describe('hslToRgb', () => {
  it('converts red hsl to rgb', () => {
    expect(hslToRgb(0, 100, 50)).toEqual([255, 0, 0]);
  });

  it('converts achromatic (s=0) to grey', () => {
    const [r, g, b] = hslToRgb(0, 0, 50);
    expect(r).toBe(g);
    expect(g).toBe(b);
  });

  it('round-trips hex → rgb → hsl → rgb → hex', () => {
    const original = '#7c6af7';
    const [r, g, b] = hexToRgb(original)!;
    const [h, s, l] = rgbToHsl(r, g, b);
    const [r2, g2, b2] = hslToRgb(h, s, l);
    expect(Math.abs(r2 - r)).toBeLessThanOrEqual(2);
    expect(Math.abs(g2 - g)).toBeLessThanOrEqual(2);
    expect(Math.abs(b2 - b)).toBeLessThanOrEqual(2);
  });
});
