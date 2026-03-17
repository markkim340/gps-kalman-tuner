export type Locale = 'ko' | 'en';

export interface Translations {
  // ─── Common ──────────────────────────────────────────────
  loading: string;
  // ─── NotFound ────────────────────────────────────────────
  notFound: string;
  goToTracker: string;
  // ─── Header ──────────────────────────────────────────────
  appTitle: string; // contains HTML: GPS <em>Kalman</em> Tuner
  appSubtitle: string;
  headerBadge: (total: number, passed: number, removed: number) => string;
  // ─── GpsInput ────────────────────────────────────────────
  gpsInputOpen: string;
  gpsInputClose: string;
  ptsLoaded: (n: number) => string;
  gpsInputDesc: string;
  supportedFormats: string;
  formatOr: string;
  gpsInputPlaceholder: string;
  gpsInputError: string;
  fileUpload: string;
  sampleData: string;
  apply: string;
  // ─── StatsCards ──────────────────────────────────────────
  distKalman: string;
  distRefined: string;
  pace: string;
  totalTime: string;
  ascent: string;
  descent: string;
  unitKm: string;
  unitMinKm: string;
  unitMmSs: string;
  unitMAscent: string;
  unitMDescent: string;
  // ─── MapControls ─────────────────────────────────────────
  display: string;
  modeRawKalman: string;
  modeRawOnly: string;
  modeKalmanOnly: string;
  modeRefined: string;
  // ─── TrackMap ────────────────────────────────────────────
  mapTitle: string;
  legendRaw: string;
  legendKalman: string;
  legendRefined: string;
  legendStart: string;
  legendEnd: string;
  // ─── Charts ──────────────────────────────────────────────
  chartAccuracy: string;
  chartAccuracyTooltip: string;
  chartElevation: string;
  chartElevTooltipKalman: string;
  chartElevTooltipRefined: string;
  chartGain: string;
  chartGainTooltip: string;
  chartGainLow: string;
  chartGainHigh: string;
  // ─── Tuner Panel ─────────────────────────────────────────
  tunerTitle: string;
  tunerSub: string;
  resetDefault: string;
  // Section titles
  sectionKalman: string;
  sectionOutlier: string;
  sectionTrack: string;
  sectionAltitude: string;
  sectionPresets: string;
  // Kalman params
  paramProcessNoise: string;
  descProcessNoise: string;
  paramAltProcessNoise: string;
  descAltProcessNoise: string;
  paramMeasureError: string;
  descMeasureError: string;
  paramAltMeasureError: string;
  descAltMeasureError: string;
  lowProcessNoise: string;
  highProcessNoise: string;
  efLowProcessNoise: string;
  efHighProcessNoise: string;
  lowAltProcessNoise: string;
  highAltProcessNoise: string;
  efLowAltProcessNoise: string;
  efHighAltProcessNoise: string;
  lowMeasureError: string;
  highMeasureError: string;
  efLowMeasureError: string;
  efHighMeasureError: string;
  lowAltMeasureError: string;
  highAltMeasureError: string;
  efLowAltMeasureError: string;
  efHighAltMeasureError: string;
  // Outlier params
  paramAccThreshold: string;
  descAccThreshold: string;
  paramMaxSpeed: string;
  descMaxSpeed: (kmh: string) => string;
  paramMinAccuracy: string;
  descMinAccuracy: string;
  paramMinDistance: string;
  descMinDistance: string;
  lowAccThreshold: string;
  highAccThreshold: string;
  efLowAccThreshold: string;
  efHighAccThreshold: string;
  lowMaxSpeed: string;
  highMaxSpeed: string;
  efLowMaxSpeed: string;
  efHighMaxSpeed: string;
  lowMinAccuracy: string;
  highMinAccuracy: string;
  efLowMinAccuracy: string;
  efHighMinAccuracy: string;
  lowMinDistance: string;
  highMinDistance: string;
  efLowMinDistance: string;
  efHighMinDistance: string;
  // Track params
  paramCornerAngle: string;
  descCornerAngle: string;
  paramMaxGap: string;
  descMaxGap: string;
  paramMinBreak: string;
  descMinBreak: string;
  lowCornerAngle: string;
  highCornerAngle: string;
  efLowCornerAngle: string;
  efHighCornerAngle: string;
  lowMaxGap: string;
  highMaxGap: string;
  efLowMaxGap: string;
  efHighMaxGap: string;
  lowMinBreak: string;
  highMinBreak: string;
  efLowMinBreak: string;
  efHighMinBreak: string;
  // Altitude params
  paramNoiseThreshold: string;
  descNoiseThreshold: string;
  paramSmoothWindow: string;
  descSmoothWindow: string;
  lowNoiseThreshold: string;
  highNoiseThreshold: string;
  efLowNoiseThreshold: string;
  efHighNoiseThreshold: string;
  lowSmoothWindow: string;
  highSmoothWindow: string;
  efLowSmoothWindow: string;
  efHighSmoothWindow: string;
  // ─── Presets ─────────────────────────────────────────────
  presetDartLabel: string;
  presetDartDesc: string;
  presetSmoothLabel: string;
  presetSmoothDesc: string;
  presetRawLabel: string;
  presetRawDesc: string;
  presetSportLabel: string;
  presetSportDesc: string;
  // ─── ResultTable ─────────────────────────────────────────
  resultTitle: string;
  colItem: string;
  colRaw: string;
  colKalman: string;
  colRefined: string;
  rowDistance: string;
  rowPace: string;
  rowPoints: string;
  rowMovingTime: string;
  rowAscent: string;
  rowDescent: string;
  rowAltRange: string;
  rowAvgSpeed: string;
}
