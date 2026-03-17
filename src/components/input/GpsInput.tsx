import { useState, useRef } from 'react';
import { useKalmanStore } from '../../stores/useKalmanStore';
import { useI18n } from '../../i18n';
import { RAW_GPS_DATA } from '../../data/rawGpsData';
import type { RawPoint } from '../../types';
import styles from './GpsInput.module.css';

function parseGpsInput(text: string): RawPoint[] | null {
  try {
    const trimmed = text.trim();
    const parsed = JSON.parse(trimmed);

    if (!Array.isArray(parsed) || parsed.length < 2) return null;

    // 형식: [[lat, lng, alt, timestamp, accuracy], ...]
    const valid = parsed.every(
      (p: unknown) =>
        Array.isArray(p) &&
        p.length >= 5 &&
        p.every((v: unknown) => typeof v === 'number')
    );
    if (valid) return parsed as RawPoint[];

    // 형식: [{ lat, lng, alt, timestamp, accuracy }, ...]
    if (typeof parsed[0] === 'object' && 'lat' in parsed[0]) {
      return parsed.map((p: Record<string, number>) => [
        p.lat, p.lng ?? p.lon, p.alt ?? p.altitude ?? 0,
        p.timestamp ?? p.ts ?? p.time ?? Date.now(),
        p.accuracy ?? p.acc ?? 10,
      ] as RawPoint);
    }

    return null;
  } catch {
    return null;
  }
}

export default function GpsInput() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const rawData = useKalmanStore((s) => s.rawData);
  const setRawData = useKalmanStore((s) => s.setRawData);
  const { t } = useI18n();

  const handleApply = () => {
    const data = parseGpsInput(inputText);
    if (!data) {
      setError(t.gpsInputError);
      return;
    }
    setError('');
    setRawData(data);
    setIsOpen(false);
    setInputText('');
    setFileName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setInputText(text);
      setError('');
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setRawData(RAW_GPS_DATA);
    setIsOpen(false);
    setInputText('');
    setFileName('');
    setError('');
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.toggleBtn} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? t.gpsInputClose : t.gpsInputOpen}
        <span className={styles.pointCount}>{t.ptsLoaded(rawData.length)}</span>
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.desc}>
            {t.gpsInputDesc}
          </div>

          <div className={styles.formatInfo}>
            <div className={styles.formatTitle}>{t.supportedFormats}</div>
            <code className={styles.formatCode}>
              {'[[lat, lng, alt, timestamp, accuracy], ...]'}
            </code>
            <div className={styles.formatOr}>{t.formatOr}</div>
            <code className={styles.formatCode}>
              {'[{ "lat": 37.5, "lng": 126.8, "alt": 19, "timestamp": 17730..., "accuracy": 14 }, ...]'}
            </code>
          </div>

          <textarea
            className={styles.textarea}
            placeholder={t.gpsInputPlaceholder}
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); setError(''); }}
            rows={6}
          />

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button
              className={styles.fileBtn}
              onClick={() => fileRef.current?.click()}
            >
              {t.fileUpload} {fileName && `(${fileName})`}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,.txt"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button className={styles.sampleBtn} onClick={handleLoadSample}>
              {t.sampleData}
            </button>
            <button
              className={styles.applyBtn}
              onClick={handleApply}
              disabled={!inputText.trim()}
            >
              {t.apply}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
