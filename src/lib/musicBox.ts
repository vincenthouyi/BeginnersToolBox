/**
 * Music Box Designer — pure utility functions.
 * These have no React or browser dependencies, making them easy to unit-test.
 */

export const DEFAULT_PITCHES: string[] = [
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
  'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6',
];

export const DEFAULT_STEPS = 16;

export interface MusicBoxPattern {
  version: 1;
  bpm: number;
  steps: number;
  pitches: string[];
  /** grid[pitchIndex][stepIndex] */
  grid: boolean[][];
}

export function createEmptyPattern(
  bpm = 120,
  pitches = DEFAULT_PITCHES,
  steps = DEFAULT_STEPS,
): MusicBoxPattern {
  return {
    version: 1,
    bpm,
    steps,
    pitches,
    grid: pitches.map(() => Array<boolean>(steps).fill(false)),
  };
}

export function serializePattern(pattern: MusicBoxPattern): string {
  return JSON.stringify(pattern, null, 2);
}

export function deserializePattern(json: string): MusicBoxPattern {
  const data: unknown = JSON.parse(json);
  if (
    typeof data !== 'object' ||
    data === null ||
    (data as Record<string, unknown>).version !== 1 ||
    typeof (data as Record<string, unknown>).bpm !== 'number' ||
    typeof (data as Record<string, unknown>).steps !== 'number' ||
    !Array.isArray((data as Record<string, unknown>).pitches) ||
    !Array.isArray((data as Record<string, unknown>).grid)
  ) {
    throw new Error('Invalid pattern format');
  }
  return data as MusicBoxPattern;
}

/** Returns a new grid with grid[pitchIdx][stepIdx] toggled (immutable). */
export function toggleNote(
  grid: boolean[][],
  pitchIdx: number,
  stepIdx: number,
): boolean[][] {
  return grid.map((row, pi) =>
    pi === pitchIdx
      ? row.map((cell, si) => (si === stepIdx ? !cell : cell))
      : row,
  );
}
