import { describe, it, expect } from 'vitest';
import {
  createEmptyPattern,
  serializePattern,
  deserializePattern,
  toggleNote,
  DEFAULT_PITCHES,
  DEFAULT_STEPS,
} from '../musicBox';

describe('createEmptyPattern', () => {
  it('creates a grid where every cell is false', () => {
    const p = createEmptyPattern();
    expect(p.grid.every((row) => row.every((cell) => !cell))).toBe(true);
  });

  it('grid has correct dimensions (pitches × steps)', () => {
    const p = createEmptyPattern();
    expect(p.grid.length).toBe(DEFAULT_PITCHES.length);
    expect(p.grid[0].length).toBe(DEFAULT_STEPS);
  });

  it('uses the provided bpm', () => {
    expect(createEmptyPattern(140).bpm).toBe(140);
  });

  it('uses custom pitches and steps', () => {
    const p = createEmptyPattern(120, ['C4', 'E4'], 8);
    expect(p.pitches).toEqual(['C4', 'E4']);
    expect(p.grid.length).toBe(2);
    expect(p.grid[0].length).toBe(8);
  });
});

describe('serializePattern / deserializePattern', () => {
  it('round-trips an empty pattern', () => {
    const p = createEmptyPattern(100);
    const json = serializePattern(p);
    const restored = deserializePattern(json);
    expect(restored.bpm).toBe(100);
    expect(restored.version).toBe(1);
    expect(restored.grid.every((r) => r.every((c) => !c))).toBe(true);
  });

  it('round-trips a pattern with toggled notes', () => {
    const p = createEmptyPattern(120);
    p.grid[0][3] = true;
    p.grid[2][7] = true;
    const restored = deserializePattern(serializePattern(p));
    expect(restored.grid[0][3]).toBe(true);
    expect(restored.grid[2][7]).toBe(true);
    expect(restored.grid[0][0]).toBe(false);
  });

  it('throws on invalid JSON', () => {
    expect(() => deserializePattern('not json')).toThrow();
  });

  it('throws when version is not 1', () => {
    const bad = JSON.stringify({ version: 2, bpm: 120, steps: 16, pitches: [], grid: [] });
    expect(() => deserializePattern(bad)).toThrow('Invalid pattern format');
  });

  it('throws when bpm is missing', () => {
    const bad = JSON.stringify({ version: 1, steps: 16, pitches: [], grid: [] });
    expect(() => deserializePattern(bad)).toThrow('Invalid pattern format');
  });

  it('throws when grid is not an array', () => {
    const bad = JSON.stringify({ version: 1, bpm: 120, steps: 16, pitches: [], grid: null });
    expect(() => deserializePattern(bad)).toThrow('Invalid pattern format');
  });
});

describe('toggleNote', () => {
  it('toggles false → true', () => {
    const p = createEmptyPattern();
    const next = toggleNote(p.grid, 0, 0);
    expect(next[0][0]).toBe(true);
  });

  it('toggles true → false', () => {
    const p = createEmptyPattern();
    const with1 = toggleNote(p.grid, 2, 5);
    const back = toggleNote(with1, 2, 5);
    expect(back[2][5]).toBe(false);
  });

  it('does not mutate other cells', () => {
    const p = createEmptyPattern();
    const next = toggleNote(p.grid, 0, 0);
    expect(next[0][1]).toBe(false);
    expect(next[1][0]).toBe(false);
  });

  it('returns a new grid object (immutable)', () => {
    const p = createEmptyPattern();
    const next = toggleNote(p.grid, 0, 0);
    expect(next).not.toBe(p.grid);
    expect(next[0]).not.toBe(p.grid[0]);
  });

  it('does not modify unchanged rows by reference', () => {
    const p = createEmptyPattern();
    const next = toggleNote(p.grid, 0, 0);
    // Row 1 is unaffected — its reference should be preserved
    expect(next[1]).toBe(p.grid[1]);
  });
});
