import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useKalmanStore } from '../../stores/useKalmanStore';
import { lerpColor } from '../../utils/format';
import styles from './TrackMap.module.css';
import 'leaflet/dist/leaflet.css';

function makeIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:12px;height:12px;background:${color};border:2px solid rgba(0,0,0,.3);border-radius:50%;box-shadow:0 0 6px ${color}88"></div>`,
    className: '',
    iconAnchor: [6, 6],
  });
}

function KalmanPolylines() {
  const kalmanPoints = useKalmanStore((s) => s.pipeline.afterKalman);
  const mapMode = useKalmanStore((s) => s.mapMode);

  if (mapMode === 'raw' || mapMode === 'refined') return null;

  const segments = [];
  for (let i = 1; i < kalmanPoints.length; i++) {
    const t = i / kalmanPoints.length;
    segments.push(
      <Polyline
        key={i}
        positions={[
          [kalmanPoints[i - 1][0], kalmanPoints[i - 1][1]],
          [kalmanPoints[i][0], kalmanPoints[i][1]],
        ]}
        pathOptions={{
          color: lerpColor('#00aa55', '#7744cc', t),
          weight: 4.5,
          opacity: 0.93,
        }}
      />
    );
  }
  return <>{segments}</>;
}

function RefinedPolylines() {
  const refinedPoints = useKalmanStore((s) => s.pipeline.refined);
  const mapMode = useKalmanStore((s) => s.mapMode);

  if (mapMode !== 'refined') return null;

  const segments = [];
  for (let i = 1; i < refinedPoints.length; i++) {
    const t = i / refinedPoints.length;
    segments.push(
      <Polyline
        key={i}
        positions={[
          [refinedPoints[i - 1][0], refinedPoints[i - 1][1]],
          [refinedPoints[i][0], refinedPoints[i][1]],
        ]}
        pathOptions={{
          color: lerpColor('#0088cc', '#cc4400', t),
          weight: 4.5,
          opacity: 0.93,
        }}
      />
    );
  }
  return <>{segments}</>;
}

function RawPolyline() {
  const rawData = useKalmanStore((s) => s.rawData);
  const mapMode = useKalmanStore((s) => s.mapMode);
  if (mapMode === 'kalman' || mapMode === 'refined') return null;

  const positions = rawData.map((p) => [p[0], p[1]] as [number, number]);
  return (
    <Polyline
      positions={positions}
      pathOptions={{ color: 'rgba(220,60,80,0.5)', weight: 2, dashArray: '5,4' }}
    />
  );
}

function FitBounds() {
  const map = useMap();
  const rawData = useKalmanStore((s) => s.rawData);
  const prevLen = useRef(0);

  useEffect(() => {
    if (rawData.length < 2) return;
    if (rawData.length === prevLen.current) return;
    prevLen.current = rawData.length;
    const bounds = L.latLngBounds(rawData.map((p) => [p[0], p[1]]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, rawData]);

  return null;
}

export default function TrackMap() {
  const rawData = useKalmanStore((s) => s.rawData);
  if (rawData.length < 1) return null;

  const rawLL = rawData.map((p) => [p[0], p[1]] as [number, number]);
  const startIcon = makeIcon('#00aa55');
  const endIcon = makeIcon('#dd6622');

  return (
    <div className={styles.mapWrap}>
      <div className={styles.mapHead}>
        <div className={styles.mapTitle}>GPS 경로 — 칼만 실시간 변화</div>
        <div className={styles.legend}>
          <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#dc3c50' }} />RAW</span>
          <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#00aa55' }} />칼만</span>
          <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#0088cc' }} />보정</span>
          <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#00aa55' }} />시작</span>
          <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#dd6622' }} />종료</span>
        </div>
      </div>
      <MapContainer
        center={rawLL[0]}
        zoom={16}
        className={styles.map}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          subdomains={['a', 'b', 'c', 'd']}
          maxZoom={20}
        />
        <FitBounds />
        <RawPolyline />
        <KalmanPolylines />
        <RefinedPolylines />
        <Marker position={rawLL[0]} icon={startIcon} />
        <Marker position={rawLL[rawLL.length - 1]} icon={endIcon} />
      </MapContainer>
    </div>
  );
}
