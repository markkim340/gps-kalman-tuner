import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, ReferenceLine, Tooltip } from 'recharts';
import { useKalmanStore } from '../../stores/useKalmanStore';
import styles from './Charts.module.css';

export default function AccuracyChart() {
  const rawData = useKalmanStore((s) => s.rawData);
  const accThreshold = useKalmanStore((s) => s.config.outlier.accThreshold);
  const data = rawData.map((p, i) => ({ idx: i, value: p[4] }));
  const avg = rawData.length > 0
    ? (rawData.reduce((s, x) => s + x[4], 0) / rawData.length).toFixed(1)
    : '0';

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartLabel}>
        GPS 정확도 (accuracy m)
        <span className={styles.chartTag}>avg {avg}m</span>
      </div>
      <ResponsiveContainer width="100%" height={88}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ccaa00" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ccaa00" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="idx" hide />
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Tooltip
            contentStyle={{ fontSize: 12, background: '#fff', border: '1px solid #ddd' }}
            formatter={(v) => [`${Number(v).toFixed(1)}m`, '정확도']}
          />
          <ReferenceLine y={accThreshold} stroke="rgba(220,60,80,0.5)" strokeDasharray="4 3" />
          <Area type="monotone" dataKey="value" stroke="#ccaa00" strokeWidth={1.5} fill="url(#accGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
