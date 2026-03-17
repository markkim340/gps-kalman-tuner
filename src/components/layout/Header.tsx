import { useKalmanStore } from '../../stores/useKalmanStore';
import styles from './Header.module.css';

export default function Header() {
  const stats = useKalmanStore((s) => s.stats);

  return (
    <header className={styles.header}>
      <div className={styles.logoRow}>
        <div className={styles.logo}>G</div>
        <div>
          <div className={styles.titleMain}>
            GPS <em>Kalman</em> Tuner
          </div>
          <div className={styles.titleSub}>KALMAN FILTER REALTIME TUNER v5</div>
        </div>
      </div>
      <div className={styles.badge}>
        {stats.raw.pointCount}pts · {stats.kalman.pointCount}통과 · {stats.raw.pointCount - stats.kalman.pointCount}제거
      </div>
    </header>
  );
}
