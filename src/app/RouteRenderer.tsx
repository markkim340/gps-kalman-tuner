import { lazy, Suspense } from 'react';

const TrackerPage = lazy(() => import('../pages/TrackerPage'));
const NotFound = lazy(() => import('../pages/NotFound'));

const ROUTE_MAP: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  '/tracker': TrackerPage,
};

interface Props {
  route: string;
}

export default function RouteRenderer({ route }: Props) {
  const Component = ROUTE_MAP[route] || NotFound;

  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>}>
      <Component />
    </Suspense>
  );
}
