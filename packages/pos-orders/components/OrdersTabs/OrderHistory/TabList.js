import React from 'react';
import styles from '../OrderHistory.module.scss';
import { isValidArray } from '~utils/Helper';

export const TabList = ({ TABS, onChange, activeId }) => {
  return (
    <div className={styles.order_options}>
      {isValidArray(TABS) &&
        TABS.map((item) => {
          return (
            <div
              key={item?.id}
              className={
                activeId === item?.id
                  ? styles.order_options_item_highlighted
                  : styles.order_options_item
              }
              onClick={() => onChange(item)}
            >
              {item?.title}
            </div>
          );
        })}
    </div>
  );
};
