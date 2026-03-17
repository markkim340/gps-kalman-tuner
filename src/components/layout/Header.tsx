import { useKalmanStore } from '../../stores/useKalmanStore';
import { useI18n } from '../../i18n';
import styles from './Header.module.css';

export default function Header() {
  const stats = useKalmanStore((s) => s.stats);
  const { t, locale, toggleLocale } = useI18n();

  const total = stats.raw.pointCount;
  const passed = stats.kalman.pointCount;
  const removed = total - passed;

  return (
    <header className={styles.header}>
      <div className={styles.logoRow}>
        <div className={styles.logo}>G</div>
        <div>
          <div
            className={styles.titleMain}
            dangerouslySetInnerHTML={{ __html: t.appTitle }}
          />
          <div className={styles.titleSub}>{t.appSubtitle}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className={styles.badge}>
          {t.headerBadge(total, passed, removed)}
        </div>
        <button
          onClick={toggleLocale}
          className={styles.langBtn}
        >
          {locale === 'ko' ? 'EN' : 'KO'}
        </button>
      </div>
    </header>
  );
}
