import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Textarea,
  ConfirmBox,
  InitialAmountPopup,
} from '@webkul/pos-ui';
import styles from './CloseCounter.module.scss';
import { Trans, t } from '@lingui/macro';
import { db } from '~/models';
import {
  showToast,
  getFormattedPrice,
  isValidArray,
  getTodayClosedCashDrawer,
  isValidObject,
  getTodayCashDrawer,
  getTodayDate,
} from '~/utils/Helper';
import { useDispatch } from 'react-redux';
import { cashDrawerActions } from '~/store/cashDrawer';
import { operationsActions } from '~/store/operations';
import SAVE_CASH_DRAWER from '~/API/mutation/SaveCashDrawer.graphql';
import { useMutation } from '@apollo/client';
import { useOfflineMode } from '~/hooks';
import { useAccessToken } from '~/hooks';

export const CloseCounter = () => {
  const [cashierAmount, setCashierAmount] = useState(0);
  const [closeStatus, setCloseStatus] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInitialAmt, setIsInitialAmt] = useState(false);
  const { accessToken } = useAccessToken();

  const [saveCashDrawer, { loading }] = useMutation(SAVE_CASH_DRAWER, {
    onError: (error) => handleError(error),
    context: {
      headers: {
        'POS-TOKEN': accessToken,
      },
    },
  });

  const { isInternetAvailable, offlineModeEnable } = useOfflineMode();

  useEffect(() => {
    if (isSuccess) {
      offlineModeEnable === '2'
        ? showToast({
          type: 'warning',
          message: t`Please check your Internet Connection !!`,
        })
        : updateCashDrawer();
      dispatch(operationsActions.setConfirmStatus({ status: true }));
    }
  }, [isSuccess, dispatch, updateCashDrawer, offlineModeEnable]);

  useEffect(() => {
    async function loadCashDrawer() {
      try {
        const cashDrawer = await db.cashDrawer.toArray();
        let todayCashDrawer = getTodayCashDrawer(cashDrawer);
        if (!todayCashDrawer) {
          const todayClosedCashDrawer = getTodayClosedCashDrawer(cashDrawer);
          !todayClosedCashDrawer && setIsInitialAmt(true);
        }
      } catch (err) {
        showToast({ type: 'error', message: err.message });
      }
    }
    loadCashDrawer();
  }, []);

  const ref = useRef(null);
  let cashAmt, cardAmt, totalAmount, totalSale, cashReturn;
  const dispatch = useDispatch();

  /**
   * Load CashDrawer from DB
   */
  useEffect(() => {
    async function loadCashDrawer() {
      try {
        let cashDrawerList = await db.cashDrawer.toArray();
        let todayCashDrawer = getTodayCashDrawer(cashDrawerList);
        let todayCashDrawerIndex =
          cashDrawerList &&
          cashDrawerList?.findIndex((item) => item?.id == todayCashDrawer?.id);

        if (cashDrawerList && isValidObject(todayCashDrawer)) {
          let cashDrawerClosedStatus =
            cashDrawerList[todayCashDrawerIndex]?.status == 0 ? false : true;

          setCloseStatus(cashDrawerClosedStatus);
          dispatch(
            cashDrawerActions.setStatus({
              status: cashDrawerClosedStatus,
            })
          );

          setCashierAmount(cashDrawerList[todayCashDrawerIndex]);
        }
      } catch {
        console.error(t`Unable to load Cash-drawer !!`);
      }
    }
    loadCashDrawer();
  }, [closeStatus, dispatch]);
  if (cashierAmount) {
    cashAmt =
      cashierAmount &&
      cashierAmount.transactions.reduce(
        (acc, current) =>
          current.payment_info_data &&
          acc +
          Number(
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
          acc + current.payment_info_data &&
            JSON.parse(current.payment_info_data).cardAmount != null
            ? Number(JSON.parse(current.payment_info_data).cardAmount)
            : 0,
        0
      );

    totalAmount =
      cashierAmount &&
      cashierAmount.transactions.reduce(
        (acc, current) => acc + Number(current.grand_total),
        0
      ) + Number(cashierAmount.initial_amount);

    totalSale =
      cashierAmount &&
      cashierAmount.transactions.reduce(
        (acc, current) => acc + Number(current.grand_total),
        0
      );

    cashReturn =
      cashierAmount &&
      cashierAmount.transactions.reduce(
        (acc, current) =>
          acc +
          (current.cashReturned != null ? Number(current.cashReturned) : 0),
        0
      );
  }

  /**
   * handle submit button for update Note
   */
  const updateCashDrawer = React.useCallback(() => {
    const note = ref.current.value;
    const cashDrawer = {
      date: getTodayDate(),
      transactions: isValidArray(cashierAmount?.transactions)
        ? cashierAmount?.transactions
        : [],
      initial_amount: cashierAmount?.initial_amount,
      base_initial_amount: cashierAmount?.base_initial_amount,
      remaining_amount: cashierAmount?.remaining_amount,
      base_remaining_amount: cashierAmount?.base_remaining_amount,
      currency_code: cashierAmount?.currency_code,
      is_synced: 1,
      closed_at: getTodayDate(),
      note: note,
      status: true,
    };

    try {
      saveCashDrawer({
        variables: { input: cashDrawer },
      });
      // updating the cashier drawer after logout
      updateDBOfCashDrawer(note, new Date());
    } catch (err) {
      console.error(err);
    }
  }, [cashierAmount, saveCashDrawer, updateDBOfCashDrawer]);

  const handleClose = () => {
    isInternetAvailable();
    dispatch(operationsActions.setConfirmStatus({ status: false }));
    setIsConfirm(!isConfirm);
  };

  const updateDBOfCashDrawer = React.useCallback((note, closedAt) => {
    db.cashDrawer
      .update(cashierAmount.id, {
        note: note,
        status: true,
        closed_at: closedAt,
      })
      .then(function (updated) {
        if (updated) {
          showToast({
            message: <Trans>Cash Drawer Close Successfully!!</Trans>,
            type: 'success',
          });

          setCloseStatus(true);
        } else console.log('something went wrong !!');
      });
  }, [cashierAmount])

  const handleError = () => {
    showToast({ type: 'error', message: t`Cash Drawer not get Saved !!` });
  };


  return (
    <React.Fragment>
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
                <h3>
                  {cashierAmount
                    ? getFormattedPrice(cashierAmount.initial_amount)
                    : `$0.00`}
                </h3>
              </li>
              <li>
                <label>
                  <Trans> Total Cash Sale </Trans>
                </label>
                <h3>
                  {cashAmt ? getFormattedPrice(cashAmt) : getFormattedPrice(0)}
                </h3>
              </li>
              <li>
                <label>
                  <Trans>Today Other Payment Sale</Trans>
                </label>
                <h3>
                  {cardAmt ? getFormattedPrice(cardAmt) : getFormattedPrice(0)}
                </h3>
              </li>
              <li>
                <label>
                  <Trans> Expected Amount in Drawer </Trans>
                </label>
                <h3>
                  {totalAmount
                    ? getFormattedPrice(totalAmount)
                    : getFormattedPrice(0)}
                </h3>
              </li>
              <li>
                <label>
                  <Trans>Difference</Trans>
                </label>
                <h3>
                  {totalSale
                    ? getFormattedPrice(totalSale)
                    : getFormattedPrice(0)}
                </h3>
              </li>
              <li>
                <label>
                  <Trans>Total Returned</Trans>
                </label>
                <h3>
                  {cashReturn
                    ? getFormattedPrice(cashReturn)
                    : getFormattedPrice(0)}
                </h3>
              </li>
            </ul>

            <h6>
              <Trans>Remarks</Trans>
            </h6>

            <Textarea
              name="remarks"
              rows="4"
              cols="50"
              placeholder={t`Remarks`}
              className="form-control"
              ref={ref}
            />
            <Button
              title={t`Close Drawer`}
              buttonType="success"
              clickHandler={handleClose}
              disabled={closeStatus ? 'true' : 'false'}
            />
          </div>
        </div>

        {isInitialAmt && (
          <InitialAmountPopup
            initialPopup={isInitialAmt}
            change={setIsInitialAmt}
          />
        )}
      </div>
      {isConfirm && (
        <ConfirmBox
          isConfirmPopup={isConfirm}
          title={t`Confirmation`}
          message={t`Do you want to close counter ? `}
          change={(isCheck) => setIsConfirm(!isCheck)}
          onSuccess={setIsSuccess}
        />
      )}
    </React.Fragment>
  );
};
