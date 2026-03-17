import { useKalmanStore } from '../../stores/useKalmanStore';
import { formatPace, formatTime } from '../../utils/format';
import styles from './Tuner.module.css';

export default function ResultTable() {
  const stats = useKalmanStore((s) => s.stats);
  const raw = stats.raw;
  const kalman = stats.kalman;
  const refined = stats.refined;

  const rows = [
    {
      label: '총거리',
      raw: `${(raw.distanceMeters / 1000).toFixed(3)} km`,
      kalman: `${(kalman.distanceMeters / 1000).toFixed(3)} km`,
      refined: `${(refined.distanceMeters / 1000).toFixed(3)} km`,
    },
    {
      label: '페이스',
      raw: formatPace(raw.paceSecPerKm),
      kalman: formatPace(kalman.paceSecPerKm),
      refined: formatPace(refined.paceSecPerKm),
    },
    {
      label: '포인트수',
      raw: `${raw.pointCount}`,
      kalman: `${kalman.pointCount}`,
      refined: `${refined.pointCount}`,
    },
    {
      label: '이동시간',
      raw: formatTime(raw.movingMs),
      kalman: formatTime(kalman.movingMs),
      refined: formatTime(refined.movingMs),
    },
    {
      label: '상승고도',
      raw: `${raw.totalAscent.toFixed(0)} m`,
      kalman: `${kalman.totalAscent.toFixed(0)} m`,
      refined: `${refined.totalAscent.toFixed(0)} m`,
    },
    {
      label: '하강고도',
      raw: `${raw.totalDescent.toFixed(0)} m`,
      kalman: `${kalman.totalDescent.toFixed(0)} m`,
      refined: `${refined.totalDescent.toFixed(0)} m`,
    },
    {
      label: '고도범위',
      raw: `${raw.altMin.toFixed(0)}~${raw.altMax.toFixed(0)} m`,
      kalman: `${kalman.altMin.toFixed(0)}~${kalman.altMax.toFixed(0)} m`,
      refined: `${refined.altMin.toFixed(0)}~${refined.altMax.toFixed(0)} m`,
    },
    {
      label: '평균속도',
      raw: `${(raw.avgSpeedMs * 3.6).toFixed(1)} km/h`,
      kalman: `${(kalman.avgSpeedMs * 3.6).toFixed(1)} km/h`,
      refined: `${(refined.avgSpeedMs * 3.6).toFixed(1)} km/h`,
    },
  ];

  return (
    <div>
      <div className={styles.sectionTitle}>현재 파라미터 결과</div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>항목</th>
            <th style={{ color: 'var(--red)' }}>RAW</th>
            <th style={{ color: 'var(--cyan)' }}>칼만</th>
            <th style={{ color: 'var(--green)' }}>보정</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td style={{ color: 'var(--red)' }}>{r.raw}</td>
              <td style={{ color: 'var(--cyan)' }}>{r.kalman}</td>
              <td style={{ color: 'var(--green)' }}>{r.refined}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
