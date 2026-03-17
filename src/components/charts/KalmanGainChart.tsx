import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useKalmanStore } from '../../stores/useKalmanStore';
import styles from './Charts.module.css';

export default function KalmanGainChart() {
  const gains = useKalmanStore((s) => s.pipeline.gains);
  const data = gains.map((g, i) => ({ idx: i, gain: g }));
  const avg = gains.length > 0 ? (gains.reduce((s, v) => s + v, 0) / gains.length).toFixed(3) : '—';

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartLabel}>
        칼만 게인(K) 시간별 변화
        <span className={styles.chartTag}>avg {avg}</span>
      </div>
      <ResponsiveContainer width="100%" height={72}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7744cc" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#7744cc" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="idx" hide />
          <YAxis hide domain={[0, 1]} />
          <Tooltip
            contentStyle={{ fontSize: 10, background: '#fff', border: '1px solid #ddd' }}
            formatter={(v) => [Number(v).toFixed(4), '게인']}
          />
          <Area type="monotone" dataKey="gain" stroke="#7744cc" strokeWidth={1.5} fill="url(#gainGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className={styles.chartEnds}>
        <span>0.0 (과거 예측 100%)</span>
        <span>1.0 (GPS 100%)</span>
      </div>
    </div>
  );
}
