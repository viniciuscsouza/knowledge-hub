'use client';

import { useTheme } from '@/context/ThemeContext';
import styles from './ThemeSwitch.module.css';

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();

  return (
    <label className={styles.switch}>
      <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
      <span className={`${styles.slider} ${styles.round}`}></span>
    </label>
  );
}
