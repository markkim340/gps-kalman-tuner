import { useKalmanStore } from '../../stores/useKalmanStore';
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

  const k = config.kalman;
  const o = config.outlier;
  const t = config.track;
  const a = config.altitude;

  return (
    <>
      <div>
        <div className={styles.panelTitle}>KALMAN TUNER</div>
        <div className={styles.panelSub}>슬라이더 조정 → 지도 라인 실시간 변화</div>
      </div>

      {/* Section 1: 칼만 필터 */}
      <div className={styles.sectionTitle}>칼만 필터 (Kalman Filter)</div>

      <ParamSlider
        name="processNoise — 위치 프로세스 노이즈"
        description="모델이 GPS 새 위치 값을 얼마나 빠르게 수용하느냐"
        value={k.processNoise}
        displayValue={k.processNoise.toFixed(2)}
        unit="process noise"
        color="var(--purple)"
        min={0.01} max={3.0} step={0.01}
        lowLabel="0.01 극부드러움" highLabel="3.0 극민감"
        lowEffect="낮으면 → 부드러운 직선" highEffect="높으면 → GPS 경로 추적"
        onChange={(v) => updateKalman({ processNoise: v })}
      />

      <ParamSlider
        name="altProcessNoise — 고도 프로세스 노이즈"
        description="칼만 필터의 고도 방향 프로세스 노이즈"
        value={k.altProcessNoise}
        displayValue={k.altProcessNoise.toFixed(2)}
        unit="alt process noise"
        color="var(--purple)"
        min={0.01} max={5.0} step={0.01}
        lowLabel="0.01 고도 부드럽게" highLabel="5.0 고도 민감"
        lowEffect="낮으면 → 고도 스무딩" highEffect="높으면 → 고도 GPS 추적"
        onChange={(v) => updateKalman({ altProcessNoise: v })}
      />

      <ParamSlider
        name="measureError — 위치 측정 오차"
        description="GPS 위치 측정 기본 오차 (R base for lat/lng)"
        value={k.measureError}
        displayValue={k.measureError.toFixed(1)}
        unit="measurement error"
        color="var(--cyan)"
        min={0.5} max={20.0} step={0.1}
        lowLabel="0.5 GPS 완전신뢰" highLabel="20.0 강한 스무딩"
        lowEffect="낮으면 → GPS 그대로" highEffect="높으면 → 강한 필터링"
        onChange={(v) => updateKalman({ measureError: v })}
      />

      <ParamSlider
        name="altMeasureError — 고도 측정 오차"
        description="GPS 고도 측정 기본 오차 (R base for altitude)"
        value={k.altMeasureError}
        displayValue={k.altMeasureError.toFixed(1)}
        unit="alt measure error"
        color="var(--cyan)"
        min={1.0} max={30.0} step={0.5}
        lowLabel="1.0 고도 GPS 신뢰" highLabel="30.0 고도 스무딩"
        lowEffect="낮으면 → 고도 GPS 우선" highEffect="높으면 → 고도 평탄화"
        onChange={(v) => updateKalman({ altMeasureError: v })}
      />

      <hr className={styles.divider} />

      {/* Section 2: 이상치 필터 */}
      <div className={styles.sectionTitle}>이상치 필터 (Outlier Filter)</div>

      <ParamSlider
        name="accThreshold — 정확도 임계값"
        description="이 값 초과 포인트는 칼만 입력에서 제외"
        value={o.accThreshold}
        displayValue={`${o.accThreshold.toFixed(0)}m`}
        unit="accuracy threshold"
        color="var(--yellow)"
        min={5} max={80} step={1}
        lowLabel="5m 엄격" highLabel="80m 관대"
        lowEffect="낮으면 → 포인트 제거 ↑" highEffect="높으면 → 노이즈 포함"
        onChange={(v) => updateOutlier({ accThreshold: v })}
      />

      <ParamSlider
        name="maxSpeedMs — 최대 속도"
        description={`이상치 속도 임계값 (현재 ${(o.maxSpeedMs * 3.6).toFixed(1)} km/h)`}
        value={o.maxSpeedMs}
        displayValue={`${o.maxSpeedMs.toFixed(1)} m/s`}
        unit={`${(o.maxSpeedMs * 3.6).toFixed(1)} km/h`}
        color="var(--orange)"
        min={5} max={40} step={0.5}
        lowLabel="5 m/s 엄격" highLabel="40 m/s 관대"
        lowEffect="낮으면 → 빠른 점 제거" highEffect="높으면 → 이상치 허용"
        onChange={(v) => updateOutlier({ maxSpeedMs: v })}
      />

      <ParamSlider
        name="minAccuracy — 최소 정확도 요구"
        description="이 값보다 정확도가 나쁘면 포인트 제거"
        value={o.minAccuracy}
        displayValue={`${o.minAccuracy.toFixed(0)}m`}
        unit="min accuracy"
        color="var(--green)"
        min={10} max={100} step={1}
        lowLabel="10m 엄격" highLabel="100m 관대"
        lowEffect="낮으면 → 정확도 높은 것만" highEffect="높으면 → 부정확도 허용"
        onChange={(v) => updateOutlier({ minAccuracy: v })}
      />

      <ParamSlider
        name="minDistance — 최소 이동 거리"
        description="연속 포인트간 최소 거리 (이하 제거)"
        value={o.minDistance}
        displayValue={`${o.minDistance.toFixed(1)}m`}
        unit="min distance"
        color="var(--red)"
        min={0.1} max={5.0} step={0.1}
        lowLabel="0.1m 촘촘" highLabel="5.0m 성긴"
        lowEffect="낮으면 → 정지 포인트 유지" highEffect="높으면 → 정지 포인트 제거"
        onChange={(v) => updateOutlier({ minDistance: v })}
      />

      <hr className={styles.divider} />

      {/* Section 3: 경로 처리 */}
      <div className={styles.sectionTitle}>경로 처리 (Track Processing)</div>

      <ParamSlider
        name="cornerPreserveAngleDeg — 코너 보존 각도"
        description="이 각도 이상의 방향 변화는 코너로 보존"
        value={t.cornerPreserveAngleDeg}
        displayValue={`${t.cornerPreserveAngleDeg.toFixed(0)}°`}
        unit="degrees"
        color="var(--purple)"
        min={10} max={90} step={1}
        lowLabel="10° 예민" highLabel="90° 둔감"
        lowEffect="낮으면 → 작은 꺾임도 보존" highEffect="높으면 → 직선 스무딩"
        onChange={(v) => updateTrack({ cornerPreserveAngleDeg: v })}
      />

      <ParamSlider
        name="maxContinuousGapSec — 최대 연속 간격"
        description="이 시간 이하의 간격은 연속 이동으로 처리"
        value={t.maxContinuousGapSec}
        displayValue={`${t.maxContinuousGapSec.toFixed(0)}s`}
        unit="seconds"
        color="var(--cyan)"
        min={3} max={30} step={1}
        lowLabel="3s 엄격" highLabel="30s 관대"
        lowEffect="낮으면 → 빈번한 구간 분리" highEffect="높으면 → 긴 갭도 연속"
        onChange={(v) => updateTrack({ maxContinuousGapSec: v })}
      />

      <ParamSlider
        name="minBreakDistanceMeters — 최소 휴식 거리"
        description="구간 분리 시 최소 이동 거리 기준"
        value={t.minBreakDistanceMeters}
        displayValue={`${t.minBreakDistanceMeters.toFixed(0)}m`}
        unit="meters"
        color="var(--orange)"
        min={5} max={100} step={1}
        lowLabel="5m 민감" highLabel="100m 둔감"
        lowEffect="낮으면 → 자주 구간 분리" highEffect="높으면 → 큰 갭만 분리"
        onChange={(v) => updateTrack({ minBreakDistanceMeters: v })}
      />

      <hr className={styles.divider} />

      {/* Section 4: 고도 설정 */}
      <div className={styles.sectionTitle}>고도 설정 (Altitude)</div>

      <ParamSlider
        name="noiseThreshold — 고도 노이즈 임계값"
        description="이 값 이하의 고도 변화는 노이즈로 처리"
        value={a.noiseThreshold}
        displayValue={`${a.noiseThreshold.toFixed(1)}m`}
        unit="noise threshold"
        color="var(--yellow)"
        min={1} max={20} step={0.5}
        lowLabel="1m 민감" highLabel="20m 둔감"
        lowEffect="낮으면 → 작은 고도차 반영" highEffect="높으면 → 고도 변화 무시"
        onChange={(v) => updateAltitude({ noiseThreshold: v })}
      />

      <ParamSlider
        name="smoothingWindow — 고도 스무딩 윈도우"
        description="고도 스무딩에 사용할 이동 평균 윈도우 크기"
        value={a.smoothingWindow}
        displayValue={`${a.smoothingWindow}`}
        unit="window size"
        color="var(--green)"
        min={1} max={15} step={2}
        lowLabel="1 스무딩 없음" highLabel="15 강한 스무딩"
        lowEffect="낮으면 → 고도 원본 유지" highEffect="높으면 → 고도 평탄화"
        onChange={(v) => updateAltitude({ smoothingWindow: v })}
      />

      <hr className={styles.divider} />

      {/* Section 5: 프리셋 */}
      <PresetGrid />

      <hr className={styles.divider} />

      {/* Section 6: 칼만 게인 차트 */}
      <KalmanGainChart />

      <hr className={styles.divider} />

      {/* Section 7: 결과 테이블 */}
      <ResultTable />

      <button className={styles.resetBtn} onClick={() => applyPreset('dart_default')}>
        ⟳ 기본값 리셋
      </button>
    </>
  );
}
