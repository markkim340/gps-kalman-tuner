import { useState, useRef } from 'react';
import { useKalmanStore } from '../../stores/useKalmanStore';
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

  const handleApply = () => {
    const data = parseGpsInput(inputText);
    if (!data) {
      setError('유효하지 않은 GPS 데이터 형식입니다. JSON 배열 형식을 확인해 주세요.');
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
        {isOpen ? '▾ GPS 경로 입력 닫기' : '▸ GPS 경로 입력'}
        <span className={styles.pointCount}>{rawData.length}pts 로드됨</span>
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.desc}>
            GPS 경로 데이터를 JSON 형식으로 붙여넣거나 파일을 업로드하세요.
          </div>

          <div className={styles.formatInfo}>
            <div className={styles.formatTitle}>지원 형식</div>
            <code className={styles.formatCode}>
              {'[[lat, lng, alt, timestamp, accuracy], ...]'}
            </code>
            <div className={styles.formatOr}>또는</div>
            <code className={styles.formatCode}>
              {'[{ "lat": 37.5, "lng": 126.8, "alt": 19, "timestamp": 17730..., "accuracy": 14 }, ...]'}
            </code>
          </div>

          <textarea
            className={styles.textarea}
            placeholder="GPS JSON 데이터를 여기에 붙여넣기..."
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
              파일 업로드 {fileName && `(${fileName})`}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,.txt"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button className={styles.sampleBtn} onClick={handleLoadSample}>
              샘플 데이터
            </button>
            <button
              className={styles.applyBtn}
              onClick={handleApply}
              disabled={!inputText.trim()}
            >
              적용하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
