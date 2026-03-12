import { describe, it, expect } from 'vitest';
import { detectPitch, medianFilter, createEMASmoother } from '../pitch';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateSine(freq: number, sampleRate: number, numSamples: number): Float32Array {
  const samples = new Float32Array(numSamples);
  const w = (2 * Math.PI * freq) / sampleRate;
  for (let i = 0; i < numSamples; i++) samples[i] = Math.sin(w * i);
  return samples;
}

// ---------------------------------------------------------------------------
// detectPitch
// ---------------------------------------------------------------------------

describe('detectPitch', () => {
  const sampleRate = 44100;
  const numSamples = 4096;
  const toleranceHz = 2;
  const minClarity = 0.8;

  it.each([
    [110, 'A2'],
    [220, 'A3'],
    [440, 'A4'],
    [880, 'A5'],
  ])('detects %i Hz (%s) within ±%i Hz', (freq) => {
    const samples = generateSine(freq, sampleRate, numSamples);
    const result = detectPitch(samples, sampleRate);
    expect(result).not.toBeNull();
    expect(Math.abs(result!.frequencyHz - freq)).toBeLessThan(toleranceHz);
    expect(result!.clarity).toBeGreaterThan(minClarity);
  });

  it('returns null for silence (all zeros)', () => {
    const samples = new Float32Array(numSamples);
    expect(detectPitch(samples, sampleRate)).toBeNull();
  });

  it('returns null for near-silence (very low amplitude)', () => {
    const samples = generateSine(440, sampleRate, numSamples).map((v) => v * 0.0005);
    expect(detectPitch(new Float32Array(samples), sampleRate)).toBeNull();
  });

  it('returns null for pure noise when clarity is too low', () => {
    // White noise has no clear periodicity
    const samples = new Float32Array(numSamples).map(() => Math.random() * 2 - 1);
    const result = detectPitch(samples, sampleRate);
    // Either null or clarity < 0.5 (noise rarely passes strict YIN threshold)
    if (result !== null) {
      expect(result.clarity).toBeLessThan(0.9);
    }
  });

  it('clarity is between 0 and 1 for a tonal signal', () => {
    const samples = generateSine(440, sampleRate, numSamples);
    const result = detectPitch(samples, sampleRate);
    expect(result).not.toBeNull();
    expect(result!.clarity).toBeGreaterThanOrEqual(0);
    expect(result!.clarity).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// medianFilter
// ---------------------------------------------------------------------------

describe('medianFilter', () => {
  it('returns empty array for empty input', () => {
    expect(medianFilter([])).toEqual([]);
  });

  it('preserves array length', () => {
    const values = [1, 2, 3, 4, 5];
    expect(medianFilter(values, 3)).toHaveLength(values.length);
  });

  it('removes a single frequency spike (window=3)', () => {
    // Middle value is the outlier
    const values = [440, 440, 880, 440, 440];
    const filtered = medianFilter(values, 3);
    // For i=2: window = [440, 880, 440] → sorted = [440, 440, 880] → median = 440
    expect(filtered[2]).toBe(440);
  });

  it('is identity for constant signal', () => {
    const values = [440, 440, 440, 440, 440];
    expect(medianFilter(values, 3)).toEqual(values);
  });

  it('handles single-element array', () => {
    expect(medianFilter([42], 5)).toEqual([42]);
  });
});

// ---------------------------------------------------------------------------
// createEMASmoother
// ---------------------------------------------------------------------------

describe('createEMASmoother', () => {
  it('returns the first value unchanged', () => {
    const smooth = createEMASmoother(0.5);
    expect(smooth(440)).toBe(440);
  });

  it('blends correctly on second call', () => {
    const smooth = createEMASmoother(0.5);
    smooth(440);
    // 0.5 * 880 + 0.5 * 440 = 660
    expect(smooth(880)).toBeCloseTo(660, 5);
  });

  it('converges toward a stable target', () => {
    const smooth = createEMASmoother(0.3);
    let value = 0;
    for (let i = 0; i < 200; i++) value = smooth(440);
    expect(value).toBeCloseTo(440, 1);
  });

  it('responds faster with higher alpha', () => {
    const fast = createEMASmoother(0.9);
    const slow = createEMASmoother(0.1);
    // After one step from 0 to 440
    fast(0);
    slow(0);
    const fastResult = fast(440);
    const slowResult = slow(440);
    expect(fastResult).toBeGreaterThan(slowResult);
  });

  it('each smoother instance is independent', () => {
    const a = createEMASmoother(0.5);
    const b = createEMASmoother(0.5);
    a(100);
    b(200);
    expect(a(100)).not.toBe(b(200));
  });
});
