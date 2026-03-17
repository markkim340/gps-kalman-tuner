import type { RawPoint } from '../types';

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function distance3d(a: RawPoint, b: RawPoint): number {
  const h = haversine(a[0], a[1], b[0], b[1]);
  const v = b[2] - a[2];
  return Math.sqrt(h * h + v * v);
}

export function sumDistance(pts: RawPoint[]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) {
    d += distance3d(pts[i - 1], pts[i]);
  }
  return d;
}
