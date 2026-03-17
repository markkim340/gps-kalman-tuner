import { create } from 'zustand';
import type {
  RawPoint, KalmanParams, OutlierParams, TrackParams, AltitudeParams,
  ProcessingConfig, MapMode, PipelineResult, RenderStats, StageStats, Preset,
} from '../types';
import { kalmanFilter3D } from '../utils/kalman';
import { isValidPoint, type OutlierFilterParams } from '../utils/outlierFilter';
import { refinePath, displayMovingStats, type TrackProcessingParams } from '../utils/trackUtils';
import { smoothAltitudes, calculateTotalAscent, calculateTotalDescent, getAltitudeRange, type AltitudeParams as AltParams } from '../utils/altitudeUtils';
// sumDistance is available from geo.ts if needed

// ─── Dart 코드 기본값 ─────────────────────────────────────────────────

export const DEFAULT_KALMAN: KalmanParams = {
  processNoise: 0.45,
  altProcessNoise: 0.9,
  measureError: 3.0,
  altMeasureError: 10.0,
  measureErrorMin: 2.0,
  measureErrorMax: 30.0,
  altMeasureErrorMin: 5.0,
  altMeasureErrorMax: 50.0,
  initialCovariance: 100,
};

export const DEFAULT_OUTLIER: OutlierParams = {
  maxSpeedMs: 15.0,
  maxDynamicSpeedMs: 24.0,
  maxAccelerationMs2: 4.0,
  minAccuracy: 50.0,
  minDistance: 1.0,
  accThreshold: 30.0,
};

export const DEFAULT_TRACK: TrackParams = {
  maxContinuousGapSec: 12.0,
  minBreakDistanceMeters: 30.0,
  cornerPreserveAngleDeg: 35.0,
  maxSmoothDistanceMeters: 50.0,
};

export const DEFAULT_ALTITUDE: AltitudeParams = {
  noiseThreshold: 5.0,
  smoothingWindow: 5,
};

export const DEFAULT_CONFIG: ProcessingConfig = {
  kalman: DEFAULT_KALMAN,
  outlier: DEFAULT_OUTLIER,
  track: DEFAULT_TRACK,
  altitude: DEFAULT_ALTITUDE,
};

// ─── Presets ──────────────────────────────────────────────────────────

export const PRESETS: Record<string, Preset> = {
  dart_default: {
    label: 'Dart 기본값',
    description: 'Flutter 앱 기본 설정',
    config: DEFAULT_CONFIG,
  },
  smooth: {
    label: '최대 스무딩',
    description: '노이즈 최소화, 경로 매끄럽게',
    config: {
      ...DEFAULT_CONFIG,
      kalman: { ...DEFAULT_KALMAN, processNoise: 0.15, altProcessNoise: 0.3, measureError: 8.0, altMeasureError: 20.0 },
      outlier: { ...DEFAULT_OUTLIER, minDistance: 2.0, accThreshold: 20.0 },
    },
  },
  raw_faithful: {
    label: 'GPS 원본 추종',
    description: '필터링 최소화, 원본 경로에 가까움',
    config: {
      ...DEFAULT_CONFIG,
      kalman: { ...DEFAULT_KALMAN, processNoise: 1.5, altProcessNoise: 2.0, measureError: 1.0, altMeasureError: 3.0 },
      outlier: { ...DEFAULT_OUTLIER, minAccuracy: 80.0, accThreshold: 50.0 },
    },
  },
  sport: {
    label: '스포츠 최적',
    description: '러닝/사이클링에 최적화',
    config: {
      ...DEFAULT_CONFIG,
      kalman: { ...DEFAULT_KALMAN, processNoise: 0.6, altProcessNoise: 0.5 },
      outlier: { ...DEFAULT_OUTLIER, maxSpeedMs: 20.0, maxDynamicSpeedMs: 30.0, accThreshold: 25.0 },
      track: { ...DEFAULT_TRACK, cornerPreserveAngleDeg: 30.0 },
    },
  },
};

// ─── Pipeline ─────────────────────────────────────────────────────────

function toOutlierParams(o: OutlierParams): OutlierFilterParams {
  return {
    maxSpeedMs: o.maxSpeedMs,
    maxDynamicSpeedMs: o.maxDynamicSpeedMs,
    maxAccelerationMs2: o.maxAccelerationMs2,
    minAccuracy: o.minAccuracy,
    minDistance: o.minDistance,
  };
}

function toTrackParams(t: TrackParams): TrackProcessingParams {
  return {
    maxContinuousGapSec: t.maxContinuousGapSec,
    minBreakDistanceMeters: t.minBreakDistanceMeters,
    cornerPreserveAngleDeg: t.cornerPreserveAngleDeg,
    maxSmoothDistanceMeters: t.maxSmoothDistanceMeters,
  };
}

function toAltParams(a: AltitudeParams): AltParams {
  return { noiseThreshold: a.noiseThreshold, smoothingWindow: a.smoothingWindow };
}

function computeStageStats(pts: RawPoint[], altParams: AltParams): StageStats {
  if (pts.length < 2) {
    const range = getAltitudeRange(pts);
    return {
      pointCount: pts.length, distanceMeters: 0, movingMs: 0,
      avgSpeedMs: 0, paceSecPerKm: 0, totalAscent: 0, totalDescent: 0,
      altMin: range.min, altMax: range.max,
    };
  }
  const stats = displayMovingStats(pts);
  const smoothed = smoothAltitudes(pts, altParams);
  const range = getAltitudeRange(smoothed);
  const paceSecPerKm = stats.distanceMeters > 0
    ? (stats.movingMs / 1000) / (stats.distanceMeters / 1000)
    : 0;

  return {
    pointCount: pts.length,
    distanceMeters: stats.distanceMeters,
    movingMs: stats.movingMs,
    avgSpeedMs: stats.avgSpeedMs,
    paceSecPerKm,
    totalAscent: calculateTotalAscent(smoothed, altParams),
    totalDescent: calculateTotalDescent(smoothed, altParams),
    altMin: range.min,
    altMax: range.max,
  };
}

function runPipeline(rawData: RawPoint[], config: ProcessingConfig): {
  pipeline: PipelineResult;
  stats: RenderStats;
} {
  const altP = toAltParams(config.altitude);
  const outlierP = toOutlierParams(config.outlier);
  const trackP = toTrackParams(config.track);

  // Stage 1: Outlier filter (accuracy + speed gate)
  const afterOutlier: RawPoint[] = [];
  let prev: RawPoint | null = null;
  for (const p of rawData) {
    if (p[4] > config.outlier.accThreshold) continue;
    if (isValidPoint(p, prev, outlierP)) {
      afterOutlier.push(p);
      prev = p;
    }
  }

  // Stage 2: Kalman filter
  const kalmanResult = kalmanFilter3D(
    afterOutlier.length >= 2 ? afterOutlier : rawData,
    config.kalman,
  );

  // Stage 3: Path refinement (dedup + transition check + corner-aware smooth)
  const refined = refinePath(kalmanResult.pts, trackP, outlierP);

  const totalMs = rawData.length >= 2
    ? rawData[rawData.length - 1][3] - rawData[0][3]
    : 0;

  return {
    pipeline: {
      raw: rawData,
      afterOutlier,
      afterKalman: kalmanResult.pts,
      refined,
      gains: kalmanResult.gains,
    },
    stats: {
      raw: computeStageStats(rawData, altP),
      kalman: computeStageStats(kalmanResult.pts, altP),
      refined: computeStageStats(refined, altP),
      totalMs,
    },
  };
}

// ─── Store ────────────────────────────────────────────────────────────

interface KalmanStore {
  rawData: RawPoint[];
  config: ProcessingConfig;
  activePreset: string | null;
  mapMode: MapMode;
  pipeline: PipelineResult;
  stats: RenderStats;
  setRawData: (data: RawPoint[]) => void;
  updateKalman: (partial: Partial<KalmanParams>) => void;
  updateOutlier: (partial: Partial<OutlierParams>) => void;
  updateTrack: (partial: Partial<TrackParams>) => void;
  updateAltitude: (partial: Partial<AltitudeParams>) => void;
  setMapMode: (mode: MapMode) => void;
  applyPreset: (name: string) => void;
  compute: () => void;
}

const EMPTY_STAGE: StageStats = {
  pointCount: 0, distanceMeters: 0, movingMs: 0, avgSpeedMs: 0,
  paceSecPerKm: 0, totalAscent: 0, totalDescent: 0, altMin: 0, altMax: 0,
};

const EMPTY_PIPELINE: PipelineResult = {
  raw: [], afterOutlier: [], afterKalman: [], refined: [], gains: [],
};

const EMPTY_STATS: RenderStats = {
  raw: EMPTY_STAGE, kalman: EMPTY_STAGE, refined: EMPTY_STAGE, totalMs: 0,
};

export const useKalmanStore = create<KalmanStore>((set, get) => ({
  rawData: [],
  config: DEFAULT_CONFIG,
  activePreset: 'dart_default',
  mapMode: 'both',
  pipeline: EMPTY_PIPELINE,
  stats: EMPTY_STATS,

  setRawData: (data) => {
    set({ rawData: data });
    get().compute();
  },

  updateKalman: (partial) => {
    const config = { ...get().config, kalman: { ...get().config.kalman, ...partial } };
    set({ config, activePreset: null });
    get().compute();
  },

  updateOutlier: (partial) => {
    const config = { ...get().config, outlier: { ...get().config.outlier, ...partial } };
    set({ config, activePreset: null });
    get().compute();
  },

  updateTrack: (partial) => {
    const config = { ...get().config, track: { ...get().config.track, ...partial } };
    set({ config, activePreset: null });
    get().compute();
  },

  updateAltitude: (partial) => {
    const config = { ...get().config, altitude: { ...get().config.altitude, ...partial } };
    set({ config, activePreset: null });
    get().compute();
  },

  setMapMode: (mode) => set({ mapMode: mode }),

  applyPreset: (name) => {
    const p = PRESETS[name];
    if (!p) return;
    set({ config: { ...p.config }, activePreset: name });
    get().compute();
  },

  compute: () => {
    const { rawData, config } = get();
    const result = runPipeline(rawData, config);
    set({ pipeline: result.pipeline, stats: result.stats });
  },
}));
