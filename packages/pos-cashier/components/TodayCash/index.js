import React, { useEffect, useState } from 'react';
import styles from './TodayCash.module.scss';
import { Trans, t } from '@lingui/macro';
import { showToast } from '~/utils/Helper';
import { db } from '~/models';
import { getFormattedPrice, getTodayCashDrawer } from '~/utils/Helper';
import CashItem from './CashItem';
let cashAmt = null;
let cardAmt = null;
/**
 * Today's Cash item component
 */
export const TodayCash = () => {
  const [cashierAmount, setCashierAmount] = useState();
  /**
   * load cash drawer data
   */
  useEffect(() => {
    async function loadCashDrawer() {
      try {
        let cashDrawerList = await db.cashDrawer.toArray();
        let todayCashDrawer = getTodayCashDrawer(cashDrawerList);
        let todayCashDrawerIndex =
          cashDrawerList &&
          cashDrawerList?.findIndex((item) => item?.id == todayCashDrawer?.id);
        if (cashDrawerList) {
          setCashierAmount(cashDrawerList[todayCashDrawerIndex]);
        }
      } catch (err) {
        showToast({ type: 'error', message: err.message });
      }
    }
    loadCashDrawer();
  }, []);
  /**
   * Check Cashier Amount and return cashAmt and cardAmt and calulate Totals
   */
  if (cashierAmount) {
    cashAmt =
      cashierAmount &&
      cashierAmount.transactions.reduce(
        (acc, current) =>
          acc +
          parseInt(
            JSON.parse(current.payment_info_data).cashAmount != null
              ? JSON.parse(current.payment_info_data).cashAmount
              : 0
          ),
        0
      );
    cardAmt =
      cashierAmount &&
      cashierAmount.transactions.reduce(
        (acc, current) =>
          acc +
          parseInt(
            JSON.parse(current.payment_info_data).cardAmount != null
              ? JSON.parse(current.payment_info_data).cardAmount
              : 0
          ),
        0
      );
  }
  return (
    <React.Fragment>
      <div className={styles.drawer}>
        <div className={styles.opening_balance}>
          <h3>
            <Trans>Opening Drawer Amount</Trans>
          </h3>
          <span className={styles.opening_drawer}>
            {cashierAmount && cashierAmount.initial_amount
              ? getFormattedPrice(cashierAmount.initial_amount)
              : getFormattedPrice(0)}
          </span>
        </div>
        <div className={styles.current_cash_bal}>
          <h3>
            <Trans>Cash Sale</Trans>
          </h3>
          <span className={styles.current_cash}>
            {cashAmt ? getFormattedPrice(cashAmt) : getFormattedPrice(0)}
          </span>
        </div>
        <div className={styles.current_card_bal}>
          <h3>
            <Trans>Other Payment Sale</Trans>
          </h3>
          <span className={styles.current_card}>
            {cardAmt ? getFormattedPrice(cardAmt) : getFormattedPrice(0)}
          </span>
        </div>
      </div>
      <div className={styles.tabledata}>
        <h3 className={styles.head}>
          <Trans>Today &apos;s sale</Trans>
        </h3>
        <div className={`${styles.pos_day} ${styles.todaycash_panel}`}>
          <div className={styles.order_list}>
            <CashItem
              header={[t`Order ID`, t`Time`, t`Order Total`, t`Payment Mode`]}
              transactions={cashierAmount && cashierAmount?.transactions}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
