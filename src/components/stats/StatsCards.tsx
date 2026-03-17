import { useKalmanStore } from '../../stores/useKalmanStore';
import { formatPace, formatTime } from '../../utils/format';
import styles from './StatsCards.module.css';

export default function StatsCards() {
  const stats = useKalmanStore((s) => s.stats);

  const cards = [
    { label: '거리 (칼만)', value: (stats.kalman.distanceMeters / 1000).toFixed(3), unit: 'km', color: 'var(--green)' },
    { label: '거리 (보정)', value: (stats.refined.distanceMeters / 1000).toFixed(3), unit: 'km', color: 'var(--cyan)' },
    { label: '페이스', value: formatPace(stats.kalman.paceSecPerKm), unit: 'min/km', color: 'var(--purple)' },
    { label: '소요 시간', value: formatTime(stats.totalMs), unit: 'mm : ss', color: 'var(--orange)' },
    { label: '상승 고도', value: stats.kalman.totalAscent.toFixed(0), unit: 'm 상승', color: 'var(--yellow)' },
    { label: '하강 고도', value: stats.kalman.totalDescent.toFixed(0), unit: 'm 하강', color: 'var(--red)' },
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
