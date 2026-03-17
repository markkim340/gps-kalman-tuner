import type { RawPoint } from '../types';
import { haversine } from './geo';

// ---------------------------------------------------------------------------
// Speed colour table (ported from Dart SpeedThreshold)
// ---------------------------------------------------------------------------

export interface SpeedThreshold {
  /** Upper bound in m/s */
  maxMs: number;
  /** CSS hex colour */
  color: string;
}

export const SPEED_THRESHOLDS: SpeedThreshold[] = [
  { maxMs: 0.5,  color: '#9E9E9E' }, // stationary – grey
  { maxMs: 1.4,  color: '#4CAF50' }, // walk        – green
  { maxMs: 3.0,  color: '#8BC34A' }, // brisk walk  – light-green
  { maxMs: 5.0,  color: '#CDDC39' }, // jog         – lime
  { maxMs: 7.0,  color: '#FFEB3B' }, // run         – yellow
  { maxMs: 10.0, color: '#FFC107' }, // fast run    – amber
  { maxMs: 15.0, color: '#FF9800' }, // sprint      – orange
  { maxMs: 20.0, color: '#FF5722' }, // bike easy   – deep-orange
  { maxMs: 30.0, color: '#F44336' }, // bike fast   – red
  { maxMs: Infinity, color: '#9C27B0' }, // vehicle  – purple
];

/**
 * Returns a CSS hex colour string matching the speed band for `speedMs`.
 */
export function speedToColor(speedMs: number): string {
  for (const band of SPEED_THRESHOLDS) {
    if (speedMs <= band.maxMs) return band.color;
  }
  return SPEED_THRESHOLDS[SPEED_THRESHOLDS.length - 1].color;
}

// ---------------------------------------------------------------------------
// Outlier filter
// ---------------------------------------------------------------------------

export interface OutlierFilterParams {
  /** Hard upper speed limit for any single step (m/s). Default 15 m/s ≈ 54 km/h */
  maxSpeedMs: number;
  /** Relaxed speed limit used when GPS accuracy is poor (m/s). Default 24 m/s ≈ 86.4 km/h */
  maxDynamicSpeedMs: number;
  /** Maximum permitted acceleration between consecutive steps (m/s²). Default 4 m/s² */
  maxAccelerationMs2: number;
  /** Points whose reported accuracy is worse (larger) than this are rejected (m). Default 50 m */
  minAccuracy: number;
  /** Points closer than this distance to the previous accepted point are rejected (m). Default 1 m */
  minDistance: number;
}

export const DEFAULT_OUTLIER_PARAMS: OutlierFilterParams = {
  maxSpeedMs: 15.0,
  maxDynamicSpeedMs: 24.0,
  maxAccelerationMs2: 4.0,
  minAccuracy: 50.0,
  minDistance: 1.0,
};

// RawPoint indices
const LAT = 0;
const LNG = 1;
// ALT = 2  (unused in 2-D checks)
const TS  = 3;
const ACC = 4;

function distanceBetween(a: RawPoint, b: RawPoint): number {
  return haversine(a[LAT], a[LNG], b[LAT], b[LNG]);
}

function dtSeconds(a: RawPoint, b: RawPoint): number {
  return Math.abs(b[TS] - a[TS]) / 1000;
}

/**
 * Pick the appropriate speed ceiling for the transition between `prev` and
 * `curr`, taking GPS uncertainty into account.
 *
 * - When both points have good accuracy (< 20 m) we enforce the strict limit.
 * - When accuracy is poor we relax toward `maxDynamicSpeedMs`.
 * - An optional external speed hint (e.g. from the device) can push the limit
 *   up further.
 */
function resolveSpeedLimitMs(
  prev: RawPoint,
  curr: RawPoint,
  params: OutlierFilterParams,
  speedHintMs = 0,
): number {
  const avgAcc = (prev[ACC] + curr[ACC]) / 2;

  // Linearly interpolate between strict and dynamic limit as accuracy worsens.
  // Full strict limit at avgAcc <= 10 m, full dynamic at avgAcc >= 50 m.
  const t = Math.max(0, Math.min(1, (avgAcc - 10) / 40));
  const accuracyBasedLimit =
    params.maxSpeedMs + t * (params.maxDynamicSpeedMs - params.maxSpeedMs);

  // Accept if a known speed hint is somewhat below the limit (GPS jitter margin).
  const hintBased = speedHintMs > 0 ? speedHintMs * 1.3 : 0;

  return Math.max(accuracyBasedLimit, hintBased);
}

/**
 * Returns `true` if `pt` should be kept as a candidate point.
 *
 * Checks:
 *  1. Accuracy within threshold.
 *  2. If a previous point is provided: minimum distance and maximum speed.
 */
export function isValidPoint(
  pt: RawPoint,
  prev: RawPoint | null,
  params: OutlierFilterParams = DEFAULT_OUTLIER_PARAMS,
): boolean {
  // 1. Accuracy gate
  if (pt[ACC] > params.minAccuracy) return false;

  if (prev === null) return true;

  // 2. Minimum distance (avoid micro-jitter duplicates)
  const d = distanceBetween(prev, pt);
  if (d < params.minDistance) return false;

  // 3. Speed gate
  const dt = dtSeconds(prev, pt);
  if (dt <= 0) return false;
  const speedMs = d / dt;
  const limit = resolveSpeedLimitMs(prev, pt, params);
  if (speedMs > limit) return false;

  return true;
}

/**
 * Returns `true` if the three-point transition prev→curr→next is plausible.
 *
 * Checks the acceleration between the implied speeds on the two legs.  A
 * single-point spike that is travelling at excessive acceleration in and out
 * of the segment is flagged as an outlier.
 */
export function isValidTransition(
  prev: RawPoint,
  curr: RawPoint,
  next: RawPoint,
  params: OutlierFilterParams = DEFAULT_OUTLIER_PARAMS,
): boolean {
  const d1 = distanceBetween(prev, curr);
  const d2 = distanceBetween(curr, next);

  const dt1 = dtSeconds(prev, curr);
  const dt2 = dtSeconds(curr, next);

  if (dt1 <= 0 || dt2 <= 0) return false;

  const v1 = d1 / dt1; // speed on leg prev→curr
  const v2 = d2 / dt2; // speed on leg curr→next

  // Time for the speed change is approximated as half of each adjacent leg.
  const dtAccel = (dt1 + dt2) / 2;
  const accel = Math.abs(v2 - v1) / dtAccel;

  // Also validate each individual leg speed against the dynamic limit.
  const limit1 = resolveSpeedLimitMs(prev, curr, params);
  const limit2 = resolveSpeedLimitMs(curr, next, params);

  if (v1 > limit1 || v2 > limit2) return false;
  if (accel > params.maxAccelerationMs2) return false;

  return true;
}
