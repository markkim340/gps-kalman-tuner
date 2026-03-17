import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useKalmanStore } from '../../stores/useKalmanStore';
import styles from './Charts.module.css';

export default function ElevationChart() {
  const afterKalman = useKalmanStore((s) => s.pipeline.afterKalman);
  const refined = useKalmanStore((s) => s.pipeline.refined);
  const stats = useKalmanStore((s) => s.stats);

  // Align refined to same length as kalman by index interpolation
  const data = afterKalman.map((p, i) => {
    const ri = Math.round((i / Math.max(afterKalman.length - 1, 1)) * (refined.length - 1));
    return {
      idx: i,
      kalman: p[2],
      refined: refined.length > 0 ? refined[Math.min(ri, refined.length - 1)][2] : undefined,
    };
  });

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartLabel}>
        고도 프로파일 (칼만 + 보정)
        <span className={styles.chartTag}>▲{stats.kalman.totalAscent.toFixed(0)}m ▼{stats.kalman.totalDescent.toFixed(0)}m</span>
      </div>
      <ResponsiveContainer width="100%" height={88}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00aa55" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#00aa55" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="refinedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0088cc" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#0088cc" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="idx" hide />
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Tooltip
            contentStyle={{ fontSize: 10, background: '#fff', border: '1px solid #ddd' }}
            formatter={(v, name) => [`${Number(v).toFixed(1)}m`, name === 'kalman' ? '칼만' : '보정']}
          />
          <Area type="monotone" dataKey="kalman" stroke="#00aa55" strokeWidth={1.5} fill="url(#elevGrad)" dot={false} />
          <Area type="monotone" dataKey="refined" stroke="#0088cc" strokeWidth={1.5} fill="url(#refinedGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
