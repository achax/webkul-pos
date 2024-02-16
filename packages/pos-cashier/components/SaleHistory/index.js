import React, { useState, useEffect } from 'react';
import styles from '../TodayCash/TodayCash.module.scss';
import { Trans } from '@lingui/macro';
import { db } from '~/models';
import SaleItem from './SaleItem';

export const SaleHistory = () => {
  const [cashierAmount, setCashierAmount] = useState(0);

  const saleHistoryTableheader = [
    'Date',
    'Cash Sale',
    'Other Payments',
    'Drawer Note',
    'Closed At',
  ];

  /**
   * load Cashdrawer data
   */
  useEffect(() => {
    async function loadCashDrawer() {
      try {
        let cashDrawer = await db.cashDrawer.orderBy('id').reverse().toArray();
        cashDrawer && setCashierAmount(cashDrawer);
      } catch (err) {
        // showToast({ type: 'error', message: err.message });
      }
    }
    loadCashDrawer();
  }, []);

  return (
    <div className={styles.order_list}>
      <h3>
        <Trans>Sales History</Trans>
      </h3>
      <div className={`${styles.pos_day} ${styles.sale_panel}`}>
        <div className={styles.order_list}>
          <SaleItem
            header={saleHistoryTableheader}
            data={cashierAmount && cashierAmount}
          />
        </div>
      </div>
    </div>
  );
};
