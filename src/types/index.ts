export type RawPoint = [number, number, number, number, number]; // lat, lng, alt, ts, acc

export interface KalmanResult {
  pts: RawPoint[];
  gains: number[];
}

// ─── Kalman Filter Params (from Dart GpsKalmanFilter) ─────────────────
export interface KalmanParams {
  processNoise: number;       // Q for lat/lng (Dart default: 0.45)
  altProcessNoise: number;    // Q for altitude (Dart default: 0.9)
  measureError: number;       // R base for lat/lng (Dart default: 3.0)
  altMeasureError: number;    // R base for altitude (Dart default: 10.0)
  measureErrorMin: number;    // clamp min (Dart: 2.0)
  measureErrorMax: number;    // clamp max (Dart: 30.0)
  altMeasureErrorMin: number; // clamp min (Dart: 5.0)
  altMeasureErrorMax: number; // clamp max (Dart: 50.0)
  initialCovariance: number;  // P0 (starting uncertainty)
}

// ─── Outlier Filter Params (from Dart GpsOutlierFilter) ───────────────
export interface OutlierParams {
  maxSpeedMs: number;         // 15.0 (54 km/h)
  maxDynamicSpeedMs: number;  // 24.0 (86.4 km/h)
  maxAccelerationMs2: number; // 4.0
  minAccuracy: number;        // 50.0
  minDistance: number;         // 1.0
  accThreshold: number;       // accuracy filter threshold (Dart: 30.0 for recording)
}

// ─── Track Processing Params (from Dart GpsTrackUtils) ────────────────
export interface TrackParams {
  maxContinuousGapSec: number;     // 12.0
  minBreakDistanceMeters: number;  // 30.0
  cornerPreserveAngleDeg: number;  // 35.0
  maxSmoothDistanceMeters: number; // 50.0
}

// ─── Altitude Params (from Dart GpsAltitudeUtils) ─────────────────────
export interface AltitudeParams {
  noiseThreshold: number;   // 5.0
  smoothingWindow: number;  // 5
}

// ─── Combined processing config ───────────────────────────────────────
export interface ProcessingConfig {
  kalman: KalmanParams;
  outlier: OutlierParams;
  track: TrackParams;
  altitude: AltitudeParams;
}

export type MapMode = 'both' | 'raw' | 'kalman' | 'refined';

// ─── Pipeline stage results ───────────────────────────────────────────
export interface PipelineResult {
  raw: RawPoint[];
  afterOutlier: RawPoint[];
  afterKalman: RawPoint[];
  refined: RawPoint[];
  gains: number[];
}

// ─── Stats for display ────────────────────────────────────────────────
export interface StageStats {
  pointCount: number;
  distanceMeters: number;
  movingMs: number;
  avgSpeedMs: number;
  paceSecPerKm: number;
  totalAscent: number;
  totalDescent: number;
  altMin: number;
  altMax: number;
}

export interface RenderStats {
  raw: StageStats;
  kalman: StageStats;
  refined: StageStats;
  totalMs: number;
}

// ─── Presets ──────────────────────────────────────────────────────────
export interface Preset {
  label: string;
  description: string;
  config: ProcessingConfig;
}
