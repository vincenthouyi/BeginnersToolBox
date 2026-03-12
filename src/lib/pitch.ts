/**
 * Pitch detection library using the YIN algorithm with parabolic interpolation.
 * Reference: de Cheveigné & Kawahara (2002). YIN, a fundamental frequency estimator for speech and music.
 */

export interface PitchResult {
  frequencyHz: number;
  clarity: number; // 0–1, higher = more confident
}

const DEFAULT_MIN_FREQ = 50;
const DEFAULT_MAX_FREQ = 2000;
const DEFAULT_THRESHOLD = 0.15;

/**
 * Detect pitch in a buffer of time-domain audio samples using YIN.
 * Suitable for 30fps real-time use with typical 2048–4096 sample buffers.
 *
 * @param samples   Float32Array of time-domain PCM samples (range –1 to 1)
 * @param sampleRate  Sample rate in Hz (e.g. 44100)
 * @param threshold   YIN CMNDF threshold (0–1). Lower = stricter. Default 0.15.
 * @returns PitchResult or null if no reliable pitch found
 */
export function detectPitch(
  samples: Float32Array,
  sampleRate: number,
  threshold = DEFAULT_THRESHOLD,
): PitchResult | null {
  // Reject silence / near-silent signals
  let power = 0;
  for (let i = 0; i < samples.length; i++) power += samples[i] * samples[i];
  power /= samples.length;
  if (power < 1e-6) return null;

  const minPeriod = Math.floor(sampleRate / DEFAULT_MAX_FREQ);
  const maxPeriod = Math.min(
    Math.floor(sampleRate / DEFAULT_MIN_FREQ),
    Math.floor(samples.length / 2) - 1,
  );
  if (maxPeriod < minPeriod) return null;

  // Steps 1 + 2: cumulative mean normalised difference function (CMNDF)
  const cmndf = computeCMNDF(samples, maxPeriod + 1);

  // Step 3: absolute threshold — first tau below threshold, then walk to local minimum
  let tauEstimate = -1;
  for (let tau = minPeriod; tau <= maxPeriod; tau++) {
    if (cmndf[tau] < threshold) {
      while (tau + 1 <= maxPeriod && cmndf[tau + 1] < cmndf[tau]) tau++;
      tauEstimate = tau;
      break;
    }
  }

  // Fallback: global minimum within search range
  if (tauEstimate === -1) {
    let minVal = Infinity;
    for (let tau = minPeriod; tau <= maxPeriod; tau++) {
      if (cmndf[tau] < minVal) {
        minVal = cmndf[tau];
        tauEstimate = tau;
      }
    }
    if (tauEstimate === -1 || cmndf[tauEstimate] > 0.5) return null;
  }

  // Step 4: parabolic interpolation for sub-sample accuracy
  const refinedTau = parabolicInterpolation(cmndf, tauEstimate, minPeriod, maxPeriod);
  const clarity = 1 - cmndf[tauEstimate];
  const frequencyHz = sampleRate / refinedTau;

  if (frequencyHz < DEFAULT_MIN_FREQ || frequencyHz > DEFAULT_MAX_FREQ) return null;

  return { frequencyHz, clarity };
}

/** Compute the YIN cumulative mean normalised difference function. */
function computeCMNDF(samples: Float32Array, halfLen: number): Float32Array {
  const cmndf = new Float32Array(halfLen);
  cmndf[0] = 1;
  let runningSum = 0;

  for (let tau = 1; tau < halfLen; tau++) {
    let sum = 0;
    const limit = samples.length - tau;
    for (let i = 0; i < limit; i++) {
      const d = samples[i] - samples[i + tau];
      sum += d * d;
    }
    runningSum += sum;
    cmndf[tau] = runningSum === 0 ? 0 : (sum * tau) / runningSum;
  }

  return cmndf;
}

/** Refine a discrete minimum index to sub-sample precision via parabolic fit. */
function parabolicInterpolation(
  arr: Float32Array,
  tau: number,
  min: number,
  max: number,
): number {
  if (tau <= min || tau >= max) return tau;
  const s0 = arr[tau - 1];
  const s1 = arr[tau];
  const s2 = arr[tau + 1];
  const denom = s0 - 2 * s1 + s2;
  if (Math.abs(denom) < 1e-10) return tau;
  return tau + (s0 - s2) / (2 * denom);
}

// ---------------------------------------------------------------------------
// Smoothing helpers
// ---------------------------------------------------------------------------

/**
 * Apply a median filter to a sequence of numbers.
 * Useful for eliminating octave-error spikes from a pitch history.
 *
 * @param values     Input array
 * @param windowSize Odd number of neighbours to consider (default 5)
 * @returns New array of the same length with smoothed values
 */
export function medianFilter(values: number[], windowSize = 5): number[] {
  if (values.length === 0) return [];
  const half = Math.floor(windowSize / 2);
  return values.map((_, i) => {
    const start = Math.max(0, i - half);
    const end = Math.min(values.length, i + half + 1);
    const window = values.slice(start, end).sort((a, b) => a - b);
    return window[Math.floor(window.length / 2)];
  });
}

/**
 * Create a stateful exponential moving average (EMA) smoother.
 * Call the returned function each frame with the latest detected frequency.
 *
 * @param alpha Smoothing factor in (0, 1]. Higher = faster response, less smoothing. Default 0.3.
 * @returns Smoother function: (value: number) => smoothedValue
 */
export function createEMASmoother(alpha = 0.3): (value: number) => number {
  let smoothed: number | null = null;
  return (value: number): number => {
    smoothed = smoothed === null ? value : alpha * value + (1 - alpha) * smoothed;
    return smoothed;
  };
}
