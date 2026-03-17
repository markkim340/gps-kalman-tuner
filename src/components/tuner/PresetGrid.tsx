import { useKalmanStore, PRESETS } from '../../stores/useKalmanStore';
import { useI18n } from '../../i18n';
import styles from './Tuner.module.css';

export default function PresetGrid() {
  const activePreset = useKalmanStore((s) => s.activePreset);
  const applyPreset = useKalmanStore((s) => s.applyPreset);
  const { t } = useI18n();

  const presetLabels: Record<string, { label: string; desc: string }> = {
    dart_default: { label: t.presetDartLabel, desc: t.presetDartDesc },
    smooth: { label: t.presetSmoothLabel, desc: t.presetSmoothDesc },
    raw_faithful: { label: t.presetRawLabel, desc: t.presetRawDesc },
    sport: { label: t.presetSportLabel, desc: t.presetSportDesc },
  };

  return (
    <div>
      <div className={styles.sectionTitle}>{t.sectionPresets}</div>
      <div className={styles.presetGrid}>
        {Object.keys(PRESETS).map((key) => {
          const labels = presetLabels[key];
          return (
            <button
              key={key}
              className={`${styles.presetBtn} ${activePreset === key ? styles.presetActive : ''}`}
              onClick={() => applyPreset(key)}
            >
              <strong>{labels?.label ?? key}</strong>
              {labels?.desc ?? ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
