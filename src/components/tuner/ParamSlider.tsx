import styles from './Tuner.module.css';

interface Props {
  name: string;
  description: string;
  value: number;
  displayValue: string;
  unit: string;
  color: string;
  min: number;
  max: number;
  step?: number;
  lowLabel: string;
  highLabel: string;
  lowEffect: string;
  highEffect: string;
  onChange: (value: number) => void;
}

export default function ParamSlider({
  name, description, value, displayValue, unit, color,
  min, max, step, lowLabel, highLabel, lowEffect, highEffect, onChange,
}: Props) {
  return (
    <div className={styles.param}>
      <div className={styles.paramHead}>
        <span className={styles.paramKey}>{name} <em style={{ color }}>{displayValue}</em></span>
      </div>
      <div className={styles.paramDesc}>{description}</div>
      <div className={styles.valBox}>
        <div className={styles.valNum} style={{ color }}>{displayValue}</div>
        <div className={styles.valUnit}>{unit}</div>
      </div>
      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className={styles.sliderEnds}>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
      <div className={styles.effectRow}>
        <div className={`${styles.effectTag} ${styles.efLow}`}>{lowEffect}</div>
        <div className={`${styles.effectTag} ${styles.efHigh}`}>{highEffect}</div>
      </div>
    </div>
  );
}
