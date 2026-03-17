import type { RawPoint } from '../types';
import { haversine } from './geo';
import {
  isValidTransition,
  DEFAULT_OUTLIER_PARAMS,
  type OutlierFilterParams,
} from './outlierFilter';

// ---------------------------------------------------------------------------
// Track processing params
// ---------------------------------------------------------------------------

export interface TrackProcessingParams {
  /** Gap larger than this (in seconds) may trigger a segment break. Default 12 s */
  maxContinuousGapSec: number;
  /** Minimum distance to consider a gap a true segment break (m). Default 30 m */
  minBreakDistanceMeters: number;
  /** Turn angle at or above this is treated as a corner and preserved (degrees). Default 35° */
  cornerPreserveAngleDeg: number;
  /** Segments with step distance above this are not smoothed (m). Default 50 m */
  maxSmoothDistanceMeters: number;
}

export const DEFAULT_TRACK_PARAMS: TrackProcessingParams = {
  maxContinuousGapSec: 12,
  minBreakDistanceMeters: 30,
  cornerPreserveAngleDeg: 35,
  maxSmoothDistanceMeters: 50,
};

// RawPoint indices
const LAT = 0;
const LNG = 1;
// ALT = 2
const TS  = 3;
const ACC = 4;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Bearing from point a to point b in radians [0, 2π).
 */
function bearingRadians(a: RawPoint, b: RawPoint): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const lat1 = toRad(a[LAT]);
  const lat2 = toRad(b[LAT]);
  const dLng = toRad(b[LNG] - a[LNG]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) + 2 * Math.PI) % (2 * Math.PI);
}

/**
 * Unsigned turn angle in degrees between leg a→b and leg b→c.
 */
function turnAngleDegrees(a: RawPoint, b: RawPoint, c: RawPoint): number {
  const b1 = bearingRadians(a, b);
  const b2 = bearingRadians(b, c);
  let diff = Math.abs(b2 - b1);
  if (diff > Math.PI) diff = 2 * Math.PI - diff;
  return (diff * 180) / Math.PI;
}

/**
 * Returns a discount ratio in [0.08, 0.28] based on the average accuracy of
 * two adjacent points.  Poorer accuracy → larger discount (more uncertainty).
 */
function uncertaintyDiscountRatio(a: RawPoint, b: RawPoint): number {
  const avgAcc = (a[ACC] + b[ACC]) / 2;
  // clamp avgAcc to [5, 50] then map linearly to [0.08, 0.28]
  const clamped = Math.max(5, Math.min(50, avgAcc));
  return 0.08 + ((clamped - 5) / 45) * 0.20;
}

// ---------------------------------------------------------------------------
// Exported helpers
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the gap between `a` and `b` constitutes a track break:
 * either the time gap AND distance both exceed thresholds, OR the implied
 * speed is above `maxSpeedMs`.
 */
export function shouldBreakSegment(
  a: RawPoint,
  b: RawPoint,
  trackParams: TrackProcessingParams = DEFAULT_TRACK_PARAMS,
  outlierParams: OutlierFilterParams = DEFAULT_OUTLIER_PARAMS,
): boolean {
  const dt = (b[TS] - a[TS]) / 1000;
  const dist = haversine(a[LAT], a[LNG], b[LAT], b[LNG]);

  if (dt > trackParams.maxContinuousGapSec && dist > trackParams.minBreakDistanceMeters) {
    return true;
  }

  if (dt > 0 && dist / dt > outlierParams.maxSpeedMs) {
    return true;
  }

  return false;
}

/**
 * Distance between two points with an uncertainty discount subtracted.
 * This avoids over-counting distance during noisy GPS periods.
 */
export function segmentDistanceMeters(a: RawPoint, b: RawPoint): number {
  const raw = haversine(a[LAT], a[LNG], b[LAT], b[LNG]);
  const discount = uncertaintyDiscountRatio(a, b);
  return raw * (1 - discount);
}

// ---------------------------------------------------------------------------
// Corner-aware smoothing
// ---------------------------------------------------------------------------

/**
 * Smooth a path while preserving corners sharper than `cornerPreserveAngleDeg`.
 *
 * For straight segments a weighted-average of the previous, current, and next
 * point coordinates is applied (weights 1 : 2 : 1).  Corners and the first /
 * last points are kept unmodified.
 */
function cornerAwareSmooth(
  pts: RawPoint[],
  params: TrackProcessingParams = DEFAULT_TRACK_PARAMS,
): RawPoint[] {
  if (pts.length < 3) return pts.slice();

  const out: RawPoint[] = [pts[0]]; // keep first point as-is

  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const next = pts[i + 1];

    const dist = haversine(prev[LAT], prev[LNG], next[LAT], next[LNG]);
    const angle = turnAngleDegrees(prev, curr, next);

    // Preserve the point if: the span is large, or this is a real corner.
    if (
      dist > params.maxSmoothDistanceMeters ||
      angle >= params.cornerPreserveAngleDeg
    ) {
      out.push(curr);
      continue;
    }

    // Weighted-average smooth (1 : 2 : 1)
    const lat = (prev[LAT] + 2 * curr[LAT] + next[LAT]) / 4;
    const lng = (prev[LNG] + 2 * curr[LNG] + next[LNG]) / 4;
    const alt = (prev[2]  + 2 * curr[2]  + next[2]) / 4;
    out.push([lat, lng, alt, curr[TS], curr[ACC]]);
  }

  out.push(pts[pts.length - 1]); // keep last point as-is
  return out;
}

// ---------------------------------------------------------------------------
// Full path refinement pipeline
// ---------------------------------------------------------------------------

/**
 * Full path refinement:
 *  1. Sort by timestamp.
 *  2. Remove exact-timestamp duplicates.
 *  3. Remove single-point spikes via three-point transition check.
 *  4. Corner-aware smoothing.
 */
export function refinePath(
  pts: RawPoint[],
  trackParams: TrackProcessingParams = DEFAULT_TRACK_PARAMS,
  outlierParams: OutlierFilterParams = DEFAULT_OUTLIER_PARAMS,
): RawPoint[] {
  if (pts.length === 0) return [];

  // 1. Sort by timestamp
  const sorted = pts.slice().sort((a, b) => a[TS] - b[TS]);

  // 2. Deduplicate exact timestamps
  const deduped: RawPoint[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][TS] !== sorted[i - 1][TS]) {
      deduped.push(sorted[i]);
    }
  }

  // 3. Outlier removal – sliding three-point window
  //    A point is removed only when both legs through it are invalid.
  if (deduped.length < 3) return cornerAwareSmooth(deduped, trackParams);

  const filtered: RawPoint[] = [deduped[0]];
  for (let i = 1; i < deduped.length - 1; i++) {
    const prev = filtered[filtered.length - 1];
    const curr = deduped[i];
    const next = deduped[i + 1];
    if (isValidTransition(prev, curr, next, outlierParams)) {
      filtered.push(curr);
    }
    // else: skip this point (outlier spike)
  }
  filtered.push(deduped[deduped.length - 1]);

  // 4. Corner-aware smoothing
  return cornerAwareSmooth(filtered, trackParams);
}

// ---------------------------------------------------------------------------
// Distance / duration statistics
// ---------------------------------------------------------------------------

/**
 * Total path distance in metres (raw haversine, no uncertainty discount).
 */
export function totalDistanceMeters(pts: RawPoint[]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) {
    d += haversine(pts[i - 1][LAT], pts[i - 1][LNG], pts[i][LAT], pts[i][LNG]);
  }
  return d;
}

/**
 * Moving duration in milliseconds.  Gaps between segments (as defined by
 * `shouldBreakSegment`) are excluded.
 */
export function movingDuration(
  pts: RawPoint[],
  trackParams: TrackProcessingParams = DEFAULT_TRACK_PARAMS,
  outlierParams: OutlierFilterParams = DEFAULT_OUTLIER_PARAMS,
): number {
  let ms = 0;
  for (let i = 1; i < pts.length; i++) {
    if (!shouldBreakSegment(pts[i - 1], pts[i], trackParams, outlierParams)) {
      ms += pts[i][TS] - pts[i - 1][TS];
    }
  }
  return ms;
}

// ---------------------------------------------------------------------------
// Display stats (no uncertainty discount – for UI presentation)
// ---------------------------------------------------------------------------

export interface MovingStats {
  /** Total distance in metres (no discount) */
  distanceMeters: number;
  /** Moving duration in milliseconds */
  movingMs: number;
  /** Average moving speed in m/s (0 if duration is 0) */
  avgSpeedMs: number;
  /** Number of GPS points in the refined path */
  pointCount: number;
}

/**
 * Compute display-ready moving stats without uncertainty discount.
 * Intended for UI visualisation (pace card, summary panel, etc.).
 */
export function displayMovingStats(
  pts: RawPoint[],
  trackParams: TrackProcessingParams = DEFAULT_TRACK_PARAMS,
  outlierParams: OutlierFilterParams = DEFAULT_OUTLIER_PARAMS,
): MovingStats {
  const distanceMeters = totalDistanceMeters(pts);
  const movingMs = movingDuration(pts, trackParams, outlierParams);
  const avgSpeedMs = movingMs > 0 ? distanceMeters / (movingMs / 1000) : 0;
  return { distanceMeters, movingMs, avgSpeedMs, pointCount: pts.length };
}
