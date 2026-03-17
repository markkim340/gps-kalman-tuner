import type { RawPoint, KalmanParams, KalmanResult } from '../types';

/**
 * 1D Kalman filter (ported from Dart _KalmanFilter1D).
 * Supports adaptive measurement error via accuracy-based clamping.
 */
class KalmanFilter1D {
  private estimate = 0;
  private errorEstimate = 1;
  private initialized = false;

  constructor(
    private baseError: number,
    private processNoise: number,
    private measureErrorMin: number,
    private measureErrorMax: number,
  ) {}

  filter(measurement: number, accuracy?: number): number {
    let measureError = accuracy ?? this.baseError;
    measureError = Math.max(this.measureErrorMin, Math.min(this.measureErrorMax, measureError));

    if (!this.initialized) {
      this.estimate = measurement;
      this.errorEstimate = measureError;
      this.initialized = true;
      return this.estimate;
    }

    const errorPredicted = this.errorEstimate + this.processNoise;
    const gain = errorPredicted / (errorPredicted + measureError);
    this.estimate += gain * (measurement - this.estimate);
    this.errorEstimate = (1 - gain) * errorPredicted;
    return this.estimate;
  }

  getGain(): number {
    const errorPredicted = this.errorEstimate + this.processNoise;
    return errorPredicted / (errorPredicted + this.errorEstimate);
  }

  reset() {
    this.initialized = false;
    this.estimate = 0;
    this.errorEstimate = 1;
  }
}

/**
 * 3D GPS Kalman filter (lat, lng, alt) - ported from Dart GpsKalmanFilter.
 * Uses separate 1D filters for each axis with independent noise parameters.
 */
export function kalmanFilter3D(pts: RawPoint[], params: KalmanParams): KalmanResult {
  if (pts.length === 0) return { pts: [], gains: [] };

  const latFilter = new KalmanFilter1D(
    params.measureError, params.processNoise,
    params.measureErrorMin, params.measureErrorMax,
  );
  const lngFilter = new KalmanFilter1D(
    params.measureError, params.processNoise,
    params.measureErrorMin, params.measureErrorMax,
  );
  const altFilter = new KalmanFilter1D(
    params.altMeasureError, params.altProcessNoise,
    params.altMeasureErrorMin, params.altMeasureErrorMax,
  );

  const out: RawPoint[] = [];
  const gains: number[] = [];

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const acc = p[4];
    const lat = latFilter.filter(p[0], acc);
    const lng = lngFilter.filter(p[1], acc);
    const alt = altFilter.filter(p[2], undefined); // altitude uses its own accuracy model

    out.push([lat, lng, alt, p[3], p[4]]);
    if (i > 0) gains.push(latFilter.getGain());
  }

  return { pts: out, gains };
}

/**
 * Legacy simple Kalman filter (for backward compatibility with original HTML behavior).
 * Single shared state with time-weighted process noise.
 */
export function kalmanFilterSimple(
  pts: RawPoint[],
  Q: number,
  R: number,
  P0: number,
): KalmanResult {
  if (pts.length === 0) return { pts: [], gains: [] };

  let kLat = pts[0][0];
  let kLng = pts[0][1];
  let kAlt = pts[0][2];
  let kAcc = P0;

  const out: RawPoint[] = [[...pts[0]] as RawPoint];
  const gains: number[] = [];

  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    const dt = (p[3] - pts[i - 1][3]) / 1000;
    const mn = Math.max(p[4], 1) * R;
    kAcc += Q * dt;
    const g = kAcc / (kAcc + mn);
    gains.push(g);
    kLat += g * (p[0] - kLat);
    kLng += g * (p[1] - kLng);
    kAlt += g * (p[2] - kAlt);
    kAcc *= 1 - g;
    out.push([kLat, kLng, kAlt, p[3], p[4]]);
  }

  return { pts: out, gains };
}
