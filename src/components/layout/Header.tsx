import { useState, useRef, useEffect } from 'react';
import { useKalmanStore } from '../../stores/useKalmanStore';
import { useI18n, LOCALE_OPTIONS } from '../../i18n';
import styles from './Header.module.css';

function LocaleSelector() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALE_OPTIONS.find((o) => o.locale === locale)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={styles.localeSel} ref={ref}>
      <button className={styles.localeBtn} onClick={() => setOpen(!open)}>
        <span className={styles.flag}>{current.flag}</span>
        <span className={styles.localeName}>{current.label}</span>
        <span className={styles.arrow}>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className={styles.localeMenu}>
          {LOCALE_OPTIONS.map((opt) => (
            <button
              key={opt.locale}
              className={`${styles.localeItem} ${opt.locale === locale ? styles.localeActive : ''}`}
              onClick={() => { setLocale(opt.locale); setOpen(false); }}
            >
              <span className={styles.flag}>{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const stats = useKalmanStore((s) => s.stats);
  const { t } = useI18n();

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
        <LocaleSelector />
      </div>
    </header>
  );
}
