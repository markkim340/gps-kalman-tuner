import type { ReactNode } from 'react';
import styles from './TwoColumnLayout.module.css';

interface Props {
  left: ReactNode;
  right: ReactNode;
}

export default function TwoColumnLayout({ left, right }: Props) {
  return (
    <div className={styles.layout}>
      <div className={styles.left}>{left}</div>
      <div className={styles.right}>{right}</div>
    </div>
  );
}
