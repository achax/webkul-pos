import React from 'react';
import styles from './ToggleSwitch.module.scss';

export const ToggleSwitch = ({ label }) => {
  return (
    <div className={styles.container}>
      <div className={styles.toggle_switch}>
        <input
          type="checkbox"
          className={styles.checkbox}
          name={label}
          id={label}
        />
        <label className={styles.label} htmlFor={label}>
          <span className={styles.inner} />
          <span className={styles.switch} />
        </label>
      </div>
    </div>
  );
};
