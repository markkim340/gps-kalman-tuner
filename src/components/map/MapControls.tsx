import { useKalmanStore } from '../../stores/useKalmanStore';
import type { MapMode } from '../../types';
import styles from './MapControls.module.css';

const MODES: { key: MapMode; label: string }[] = [
  { key: 'both', label: 'RAW + 칼만' },
  { key: 'raw', label: 'RAW만' },
  { key: 'kalman', label: '칼만만' },
  { key: 'refined', label: '보정 경로' },
];

export default function MapControls() {
  const mapMode = useKalmanStore((s) => s.mapMode);
  const setMapMode = useKalmanStore((s) => s.setMapMode);
  const stats = useKalmanStore((s) => s.stats);

  return (
    <div className={styles.controls}>
      <span className={styles.label}>표시</span>
      {MODES.map((m) => (
        <button
          key={m.key}
          className={`${styles.btn} ${mapMode === m.key ? styles.active : ''}`}
          onClick={() => setMapMode(m.key)}
        >
          {m.label}
        </button>
      ))}
      <span className={styles.elevBadge}>
        ⛰ {stats.kalman.altMax.toFixed(0)}m → {stats.kalman.altMin.toFixed(0)}m
      </span>
    </div>
  );
}
