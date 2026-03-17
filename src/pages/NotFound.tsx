import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', gap: 12,
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <h1 style={{ fontSize: 48, fontFamily: "'Bebas Neue', sans-serif", color: '#333' }}>404</h1>
      <p style={{ color: '#888' }}>페이지를 찾을 수 없습니다.</p>
      <Link to="/tracker" style={{ color: '#00aa55', fontSize: 14 }}>트래커로 이동 →</Link>
    </div>
  );
}
