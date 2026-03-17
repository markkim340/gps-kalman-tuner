import type { RawPoint } from '../types';

// ---------------------------------------------------------------------------
// Altitude processing params
// ---------------------------------------------------------------------------

export interface AltitudeParams {
  /** Altitude changes smaller than this are treated as sensor noise (m). Default 5 m */
  noiseThreshold: number;
  /** Number of points in the moving-average window. Default 5 */
  smoothingWindow: number;
}

export const DEFAULT_ALTITUDE_PARAMS: AltitudeParams = {
  noiseThreshold: 5.0,
  smoothingWindow: 5,
};

// RawPoint index for altitude
const ALT = 2;

// ---------------------------------------------------------------------------
// Smoothing
// ---------------------------------------------------------------------------

/**
 * Smooth altitude values with a centred moving average of width
 * `params.smoothingWindow`.
 *
 * Points near the start/end of the track use a smaller available window
 * (they are not padded or clamped, they simply average what is available).
 *
 * Returns a new array of RawPoints with the smoothed altitude applied.  All
 * other fields are preserved from the original point.
 */
export function smoothAltitudes(
  pts: RawPoint[],
  params: AltitudeParams = DEFAULT_ALTITUDE_PARAMS,
): RawPoint[] {
  if (pts.length === 0) return [];

  const half = Math.floor(params.smoothingWindow / 2);
  return pts.map((pt, i): RawPoint => {
    const lo = Math.max(0, i - half);
    const hi = Math.min(pts.length - 1, i + half);
    let sum = 0;
    for (let j = lo; j <= hi; j++) sum += pts[j][ALT];
    const avg = sum / (hi - lo + 1);
    return [pt[0], pt[1], avg, pt[3], pt[4]];
  });
}

// ---------------------------------------------------------------------------
// Ascent / descent
// ---------------------------------------------------------------------------

/**
 * Total ascent in metres, ignoring altitude gains below `params.noiseThreshold`.
 */
export function calculateTotalAscent(
  pts: RawPoint[],
  params: AltitudeParams = DEFAULT_ALTITUDE_PARAMS,
): number {
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const delta = pts[i][ALT] - pts[i - 1][ALT];
    if (delta > params.noiseThreshold) total += delta;
  }
  return total;
}

/**
 * Total descent in metres (positive value), ignoring drops below
 * `params.noiseThreshold`.
 */
export function calculateTotalDescent(
  pts: RawPoint[],
  params: AltitudeParams = DEFAULT_ALTITUDE_PARAMS,
): number {
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const delta = pts[i - 1][ALT] - pts[i][ALT]; // positive when descending
    if (delta > params.noiseThreshold) total += delta;
  }
  return total;
}

// ---------------------------------------------------------------------------
// Range
// ---------------------------------------------------------------------------

export interface AltitudeRange {
  min: number;
  max: number;
}

/**
 * Returns the minimum and maximum altitude in the path.
 * Returns `{ min: 0, max: 0 }` for an empty path.
 */
export function getAltitudeRange(pts: RawPoint[]): AltitudeRange {
  if (pts.length === 0) return { min: 0, max: 0 };
  let min = pts[0][ALT];
  let max = pts[0][ALT];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i][ALT];
    if (a < min) min = a;
    if (a > max) max = a;
  }
  return { min, max };
}
