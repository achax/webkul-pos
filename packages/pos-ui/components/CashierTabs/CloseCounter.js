import React, { useState, useEffect } from 'react';
import { Button, Textarea } from '../';
import styles from './CloseCounter.module.scss';
import { Trans, t } from '@lingui/macro';
import { db } from '~/models';
import { showToast } from '~/utils/Helper';

export const CloseCounter = () => {
  const [cashierAmount, setCashierAmount] = useState();
  let cashAmt, cardAmt, total, cashReturn;

  useEffect(() => {
    async function loadCashDrawer() {
      try {
        const cashDrawer = await db.cashDrawer.toArray()
        setCashierAmount(cashDrawer[0]);
      } catch (err) {
        showToast({ type: 'error', message: err.message });
      }
    }
    loadCashDrawer();
  }, []);

  if (cashierAmount) {
    cashAmt =
      cashierAmount &&
      cashierAmount.transaction.reduce(
        (acc, current) => acc + parseInt(current.cash_received),
        0
      );

    cardAmt =
      cashierAmount &&
      cashierAmount.transaction.reduce(
        (acc, current) => acc + parseInt(current?.cash_received),
        0
      );

    total =
      cashierAmount &&
      cashierAmount.transaction.reduce(
        (acc, current) => acc + parseInt(current?.grand_total),
        0
      );

    cashReturn =
      cashierAmount &&
      cashierAmount.transaction.reduce(
        (acc, current) =>
          acc +
          (current?.cash_returned != null ? parseInt(current?.cash_returned) : 0),
        0
      );
  }

  return (
    <>
      <div className={styles.pos__drawer_amount}>
        <div>
          <div>
            <h3>
              <Trans>Drawer Account Summary</Trans>
            </h3>
            <ul>
              <li>
                <label>
                  <Trans> Opening Amount </Trans>
                </label>
                <h3>${cashierAmount && cashierAmount.initialAmount}</h3>
              </li>
              <li>
                <label>
                  <Trans> Total Cash Sale </Trans>
                </label>
                <h3>${cashierAmount && cashAmt}</h3>
              </li>
              <li>
                <label>
                  <Trans>Today Other Payment Sale</Trans>
                </label>
                <h3>${cashierAmount && cardAmt}</h3>
              </li>
              <li>
                <label>
                  <Trans> Expected Amount in Drawer </Trans>
                </label>
                <h3>${cashierAmount && total}</h3>
              </li>
              <li>
                <label>
                  <Trans>Difference</Trans>
                </label>
                <h3>${cashierAmount && cashReturn}</h3>
              </li>
              <li>
                <label>
                  <Trans>Total Change</Trans>
                </label>
                <h3>$0.00</h3>
              </li>
            </ul>
            <h3>
              <Trans>Remarks</Trans>
            </h3>
            <Textarea
              name="remarks"
              rows="4"
              cols="50"
              placeholder={t`Remarks`}
              className="form-control"
            />
            <Button title={t`Close Drawer`} buttonType="success" />
          </div>
        </div>
      </div>
    </>
  );
};
