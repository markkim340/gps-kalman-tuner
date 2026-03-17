import { useKalmanStore, PRESETS } from '../../stores/useKalmanStore';
import styles from './Tuner.module.css';

export default function PresetGrid() {
  const activePreset = useKalmanStore((s) => s.activePreset);
  const applyPreset = useKalmanStore((s) => s.applyPreset);

  return (
    <div>
      <div className={styles.sectionTitle}>빠른 프리셋</div>
      <div className={styles.presetGrid}>
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            className={`${styles.presetBtn} ${activePreset === key ? styles.presetActive : ''}`}
            onClick={() => applyPreset(key)}
          >
            <strong>{p.label}</strong>
            {p.description}
          </button>
        ))}
      </div>
    </div>
  );
}
