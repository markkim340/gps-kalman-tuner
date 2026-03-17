import { useKalmanStore } from '../../stores/useKalmanStore';
import { useI18n } from '../../i18n';
import type { MapMode } from '../../types';
import styles from './MapControls.module.css';

export default function MapControls() {
  const mapMode = useKalmanStore((s) => s.mapMode);
  const setMapMode = useKalmanStore((s) => s.setMapMode);
  const stats = useKalmanStore((s) => s.stats);
  const { t } = useI18n();

  const MODES: { key: MapMode; label: string }[] = [
    { key: 'both', label: t.modeRawKalman },
    { key: 'raw', label: t.modeRawOnly },
    { key: 'kalman', label: t.modeKalmanOnly },
    { key: 'refined', label: t.modeRefined },
  ];

  return (
    <div className={styles.controls}>
      <span className={styles.label}>{t.display}</span>
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
