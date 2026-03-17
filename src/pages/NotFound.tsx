import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', gap: 12,
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <h1 style={{ fontSize: 48, fontFamily: "'Bebas Neue', sans-serif", color: '#333' }}>404</h1>
      <p style={{ color: '#888' }}>{t.notFound}</p>
      <Link to="/tracker" style={{ color: '#00aa55', fontSize: 14 }}>{t.goToTracker}</Link>
    </div>
  );
}
