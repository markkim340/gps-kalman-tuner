import { useKalmanStore } from '../../stores/useKalmanStore';
import { useI18n } from '../../i18n';
import ParamSlider from './ParamSlider';
import PresetGrid from './PresetGrid';
import KalmanGainChart from '../charts/KalmanGainChart';
import ResultTable from './ResultTable';
import styles from './Tuner.module.css';

export default function TunerPanel() {
  const config = useKalmanStore((s) => s.config);
  const updateKalman = useKalmanStore((s) => s.updateKalman);
  const updateOutlier = useKalmanStore((s) => s.updateOutlier);
  const updateTrack = useKalmanStore((s) => s.updateTrack);
  const updateAltitude = useKalmanStore((s) => s.updateAltitude);
  const applyPreset = useKalmanStore((s) => s.applyPreset);
  const { t } = useI18n();

  const k = config.kalman;
  const o = config.outlier;
  const tr = config.track;
  const a = config.altitude;

  return (
    <>
      <div>
        <div className={styles.panelTitle}>{t.tunerTitle}</div>
        <div className={styles.panelSub}>{t.tunerSub}</div>
      </div>

      {/* Section 1: Kalman Filter */}
      <div className={styles.sectionTitle}>{t.sectionKalman}</div>

      <ParamSlider
        name={t.paramProcessNoise}
        description={t.descProcessNoise}
        value={k.processNoise}
        displayValue={k.processNoise.toFixed(2)}
        unit="process noise"
        color="var(--purple)"
        min={0.01} max={3.0} step={0.01}
        lowLabel={t.lowProcessNoise} highLabel={t.highProcessNoise}
        lowEffect={t.efLowProcessNoise} highEffect={t.efHighProcessNoise}
        onChange={(v) => updateKalman({ processNoise: v })}
      />

      <ParamSlider
        name={t.paramAltProcessNoise}
        description={t.descAltProcessNoise}
        value={k.altProcessNoise}
        displayValue={k.altProcessNoise.toFixed(2)}
        unit="alt process noise"
        color="var(--purple)"
        min={0.01} max={5.0} step={0.01}
        lowLabel={t.lowAltProcessNoise} highLabel={t.highAltProcessNoise}
        lowEffect={t.efLowAltProcessNoise} highEffect={t.efHighAltProcessNoise}
        onChange={(v) => updateKalman({ altProcessNoise: v })}
      />

      <ParamSlider
        name={t.paramMeasureError}
        description={t.descMeasureError}
        value={k.measureError}
        displayValue={k.measureError.toFixed(1)}
        unit="measurement error"
        color="var(--cyan)"
        min={0.5} max={20.0} step={0.1}
        lowLabel={t.lowMeasureError} highLabel={t.highMeasureError}
        lowEffect={t.efLowMeasureError} highEffect={t.efHighMeasureError}
        onChange={(v) => updateKalman({ measureError: v })}
      />

      <ParamSlider
        name={t.paramAltMeasureError}
        description={t.descAltMeasureError}
        value={k.altMeasureError}
        displayValue={k.altMeasureError.toFixed(1)}
        unit="alt measure error"
        color="var(--cyan)"
        min={1.0} max={30.0} step={0.5}
        lowLabel={t.lowAltMeasureError} highLabel={t.highAltMeasureError}
        lowEffect={t.efLowAltMeasureError} highEffect={t.efHighAltMeasureError}
        onChange={(v) => updateKalman({ altMeasureError: v })}
      />

      <hr className={styles.divider} />

      {/* Section 2: Outlier Filter */}
      <div className={styles.sectionTitle}>{t.sectionOutlier}</div>

      <ParamSlider
        name={t.paramAccThreshold}
        description={t.descAccThreshold}
        value={o.accThreshold}
        displayValue={`${o.accThreshold.toFixed(0)}m`}
        unit="accuracy threshold"
        color="var(--yellow)"
        min={5} max={80} step={1}
        lowLabel={t.lowAccThreshold} highLabel={t.highAccThreshold}
        lowEffect={t.efLowAccThreshold} highEffect={t.efHighAccThreshold}
        onChange={(v) => updateOutlier({ accThreshold: v })}
      />

      <ParamSlider
        name={t.paramMaxSpeed}
        description={t.descMaxSpeed((o.maxSpeedMs * 3.6).toFixed(1))}
        value={o.maxSpeedMs}
        displayValue={`${o.maxSpeedMs.toFixed(1)} m/s`}
        unit={`${(o.maxSpeedMs * 3.6).toFixed(1)} km/h`}
        color="var(--orange)"
        min={5} max={40} step={0.5}
        lowLabel={t.lowMaxSpeed} highLabel={t.highMaxSpeed}
        lowEffect={t.efLowMaxSpeed} highEffect={t.efHighMaxSpeed}
        onChange={(v) => updateOutlier({ maxSpeedMs: v })}
      />

      <ParamSlider
        name={t.paramMinAccuracy}
        description={t.descMinAccuracy}
        value={o.minAccuracy}
        displayValue={`${o.minAccuracy.toFixed(0)}m`}
        unit="min accuracy"
        color="var(--green)"
        min={10} max={100} step={1}
        lowLabel={t.lowMinAccuracy} highLabel={t.highMinAccuracy}
        lowEffect={t.efLowMinAccuracy} highEffect={t.efHighMinAccuracy}
        onChange={(v) => updateOutlier({ minAccuracy: v })}
      />

      <ParamSlider
        name={t.paramMinDistance}
        description={t.descMinDistance}
        value={o.minDistance}
        displayValue={`${o.minDistance.toFixed(1)}m`}
        unit="min distance"
        color="var(--red)"
        min={0.1} max={5.0} step={0.1}
        lowLabel={t.lowMinDistance} highLabel={t.highMinDistance}
        lowEffect={t.efLowMinDistance} highEffect={t.efHighMinDistance}
        onChange={(v) => updateOutlier({ minDistance: v })}
      />

      <hr className={styles.divider} />

      {/* Section 3: Track Processing */}
      <div className={styles.sectionTitle}>{t.sectionTrack}</div>

      <ParamSlider
        name={t.paramCornerAngle}
        description={t.descCornerAngle}
        value={tr.cornerPreserveAngleDeg}
        displayValue={`${tr.cornerPreserveAngleDeg.toFixed(0)}°`}
        unit="degrees"
        color="var(--purple)"
        min={10} max={90} step={1}
        lowLabel={t.lowCornerAngle} highLabel={t.highCornerAngle}
        lowEffect={t.efLowCornerAngle} highEffect={t.efHighCornerAngle}
        onChange={(v) => updateTrack({ cornerPreserveAngleDeg: v })}
      />

      <ParamSlider
        name={t.paramMaxGap}
        description={t.descMaxGap}
        value={tr.maxContinuousGapSec}
        displayValue={`${tr.maxContinuousGapSec.toFixed(0)}s`}
        unit="seconds"
        color="var(--cyan)"
        min={3} max={30} step={1}
        lowLabel={t.lowMaxGap} highLabel={t.highMaxGap}
        lowEffect={t.efLowMaxGap} highEffect={t.efHighMaxGap}
        onChange={(v) => updateTrack({ maxContinuousGapSec: v })}
      />

      <ParamSlider
        name={t.paramMinBreak}
        description={t.descMinBreak}
        value={tr.minBreakDistanceMeters}
        displayValue={`${tr.minBreakDistanceMeters.toFixed(0)}m`}
        unit="meters"
        color="var(--orange)"
        min={5} max={100} step={1}
        lowLabel={t.lowMinBreak} highLabel={t.highMinBreak}
        lowEffect={t.efLowMinBreak} highEffect={t.efHighMinBreak}
        onChange={(v) => updateTrack({ minBreakDistanceMeters: v })}
      />

      <hr className={styles.divider} />

      {/* Section 4: Altitude */}
      <div className={styles.sectionTitle}>{t.sectionAltitude}</div>

      <ParamSlider
        name={t.paramNoiseThreshold}
        description={t.descNoiseThreshold}
        value={a.noiseThreshold}
        displayValue={`${a.noiseThreshold.toFixed(1)}m`}
        unit="noise threshold"
        color="var(--yellow)"
        min={1} max={20} step={0.5}
        lowLabel={t.lowNoiseThreshold} highLabel={t.highNoiseThreshold}
        lowEffect={t.efLowNoiseThreshold} highEffect={t.efHighNoiseThreshold}
        onChange={(v) => updateAltitude({ noiseThreshold: v })}
      />

      <ParamSlider
        name={t.paramSmoothWindow}
        description={t.descSmoothWindow}
        value={a.smoothingWindow}
        displayValue={`${a.smoothingWindow}`}
        unit="window size"
        color="var(--green)"
        min={1} max={15} step={2}
        lowLabel={t.lowSmoothWindow} highLabel={t.highSmoothWindow}
        lowEffect={t.efLowSmoothWindow} highEffect={t.efHighSmoothWindow}
        onChange={(v) => updateAltitude({ smoothingWindow: v })}
      />

      <hr className={styles.divider} />

      {/* Section 5: Presets */}
      <PresetGrid />

      <hr className={styles.divider} />

      {/* Section 6: Kalman Gain Chart */}
      <KalmanGainChart />

      <hr className={styles.divider} />

      {/* Section 7: Result Table */}
      <ResultTable />

      <button className={styles.resetBtn} onClick={() => applyPreset('dart_default')}>
        {t.resetDefault}
      </button>
    </>
  );
}
