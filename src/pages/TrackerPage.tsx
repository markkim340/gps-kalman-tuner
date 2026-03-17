import TwoColumnLayout from '../components/layout/TwoColumnLayout';
import Header from '../components/layout/Header';
import GpsInput from '../components/input/GpsInput';
import StatsCards from '../components/stats/StatsCards';
import MapControls from '../components/map/MapControls';
import TrackMap from '../components/map/TrackMap';
import AccuracyChart from '../components/charts/AccuracyChart';
import ElevationChart from '../components/charts/ElevationChart';
import TunerPanel from '../components/tuner/TunerPanel';
import chartStyles from '../components/charts/Charts.module.css';

export default function TrackerPage() {
  return (
    <TwoColumnLayout
      left={
        <>
          <Header />
          <GpsInput />
          <StatsCards />
          <MapControls />
          <TrackMap />
          <div className={chartStyles.chartsRow}>
            <AccuracyChart />
            <ElevationChart />
          </div>
        </>
      }
      right={<TunerPanel />}
    />
  );
}
