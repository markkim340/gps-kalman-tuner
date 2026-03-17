import { useKalmanStore } from '../../stores/useKalmanStore';
import { useI18n } from '../../i18n';
import { formatPace, formatTime } from '../../utils/format';
import styles from './StatsCards.module.css';

export default function StatsCards() {
  const stats = useKalmanStore((s) => s.stats);
  const { t } = useI18n();

  const cards = [
    { label: t.distKalman, value: (stats.kalman.distanceMeters / 1000).toFixed(3), unit: t.unitKm, color: 'var(--green)' },
    { label: t.distRefined, value: (stats.refined.distanceMeters / 1000).toFixed(3), unit: t.unitKm, color: 'var(--cyan)' },
    { label: t.pace, value: formatPace(stats.kalman.paceSecPerKm), unit: t.unitMinKm, color: 'var(--purple)' },
    { label: t.totalTime, value: formatTime(stats.totalMs), unit: t.unitMmSs, color: 'var(--orange)' },
    { label: t.ascent, value: stats.kalman.totalAscent.toFixed(0), unit: t.unitMAscent, color: 'var(--yellow)' },
    { label: t.descent, value: stats.kalman.totalDescent.toFixed(0), unit: t.unitMDescent, color: 'var(--red)' },
  ];

  return (
    <div className={styles.stats} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {cards.map((c) => (
        <div className={styles.card} key={c.label}>
          <div className={styles.label}>{c.label}</div>
          <div className={styles.value} style={{ color: c.color }}>{c.value}</div>
          <div className={styles.unit}>{c.unit}</div>
        </div>
      ))}
    </div>
  );
}
