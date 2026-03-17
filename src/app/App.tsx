import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RouteRenderer from './RouteRenderer';

const TrackerPage = lazy(() => import('../pages/TrackerPage'));
const NotFound = lazy(() => import('../pages/NotFound'));

const Loading = () => (
  <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/tracker" replace />} />
          <Route path="/tracker" element={<TrackerPage />} />
          {/* RouteRenderer: route string으로 동적 렌더링 */}
          <Route path="/render/:route" element={<DynamicRoute />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function DynamicRoute() {
  const path = '/' + (window.location.pathname.split('/render/')[1] || '');
  return <RouteRenderer route={path} />;
}
