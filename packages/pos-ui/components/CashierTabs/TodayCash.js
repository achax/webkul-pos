import React, { useEffect, useState } from 'react';
import { tbodyData } from '../../../../utils/tbodyData';
import { theadData } from '../../../../utils/theadData';
import { Table } from '../Table';
import styles from './TodayCash.module.scss';
import { Trans } from '@lingui/macro';
import { showToast } from '~/utils/Helper';
import { db } from '~/models';

export const TodayCash = () => {
  const [
    ,
    // cashierAmount
    setCashierAmount,
  ] = useState();
  const current = new Date();
  const date = `${current.getDate()}-${
    current.getMonth() + 1
  }-${current.getFullYear()}`;

  useEffect(() => {
    async function loadCashDrawer() {
      try {
        setCashierAmount(
          await db.cashDrawer.where('date').equalsIgnoreCase(date).toArray()[0]
        );
      } catch (err) {
        showToast({ type: 'error', message: err.message });
      }
    }
    loadCashDrawer();
  }, [date]);

  return (
    <React.Fragment>
      <div>
        <div className={styles.drawer}>
          <div className={styles.opening_balance}>
            <h3>
              <Trans>Opening Drawer Amount</Trans>
            </h3>
            <span className={styles.opening_drawer}>$0.00</span>
          </div>
          <div className={styles.current_cash_bal}>
            <h3>
              <Trans>Today Cash Sale</Trans>
            </h3>
            <span className={styles.current_cash}>$0.00</span>
          </div>
          <div className={styles.current_card_bal}>
            <h3>
              <Trans>Today Other Payment Sale</Trans>
            </h3>
            <span className={styles.current_card}>$0.00</span>
          </div>
        </div>
        <div className={styles.tabledata}>
          <h3>
            <Trans>Today &apos;s sale</Trans>
          </h3>
          <div className={styles.pos_day}>
            <Table theadData={theadData} tbodyData={tbodyData} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
