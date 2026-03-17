import { useKalmanStore } from '../../stores/useKalmanStore';
import { useI18n } from '../../i18n';
import { formatPace, formatTime } from '../../utils/format';
import styles from './Tuner.module.css';

export default function ResultTable() {
  const stats = useKalmanStore((s) => s.stats);
  const { t } = useI18n();
  const raw = stats.raw;
  const kalman = stats.kalman;
  const refined = stats.refined;

  const rows = [
    {
      label: t.rowDistance,
      raw: `${(raw.distanceMeters / 1000).toFixed(3)} km`,
      kalman: `${(kalman.distanceMeters / 1000).toFixed(3)} km`,
      refined: `${(refined.distanceMeters / 1000).toFixed(3)} km`,
    },
    {
      label: t.rowPace,
      raw: formatPace(raw.paceSecPerKm),
      kalman: formatPace(kalman.paceSecPerKm),
      refined: formatPace(refined.paceSecPerKm),
    },
    {
      label: t.rowPoints,
      raw: `${raw.pointCount}`,
      kalman: `${kalman.pointCount}`,
      refined: `${refined.pointCount}`,
    },
    {
      label: t.rowMovingTime,
      raw: formatTime(raw.movingMs),
      kalman: formatTime(kalman.movingMs),
      refined: formatTime(refined.movingMs),
    },
    {
      label: t.rowAscent,
      raw: `${raw.totalAscent.toFixed(0)} m`,
      kalman: `${kalman.totalAscent.toFixed(0)} m`,
      refined: `${refined.totalAscent.toFixed(0)} m`,
    },
    {
      label: t.rowDescent,
      raw: `${raw.totalDescent.toFixed(0)} m`,
      kalman: `${kalman.totalDescent.toFixed(0)} m`,
      refined: `${refined.totalDescent.toFixed(0)} m`,
    },
    {
      label: t.rowAltRange,
      raw: `${raw.altMin.toFixed(0)}~${raw.altMax.toFixed(0)} m`,
      kalman: `${kalman.altMin.toFixed(0)}~${kalman.altMax.toFixed(0)} m`,
      refined: `${refined.altMin.toFixed(0)}~${refined.altMax.toFixed(0)} m`,
    },
    {
      label: t.rowAvgSpeed,
      raw: `${(raw.avgSpeedMs * 3.6).toFixed(1)} km/h`,
      kalman: `${(kalman.avgSpeedMs * 3.6).toFixed(1)} km/h`,
      refined: `${(refined.avgSpeedMs * 3.6).toFixed(1)} km/h`,
    },
  ];

  return (
    <div>
      <div className={styles.sectionTitle}>{t.resultTitle}</div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t.colItem}</th>
            <th style={{ color: 'var(--red)' }}>{t.colRaw}</th>
            <th style={{ color: 'var(--cyan)' }}>{t.colKalman}</th>
            <th style={{ color: 'var(--green)' }}>{t.colRefined}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td style={{ color: 'var(--red)' }}>{r.raw}</td>
              <td style={{ color: 'var(--cyan)' }}>{r.kalman}</td>
              <td style={{ color: 'var(--green)' }}>{r.refined}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
