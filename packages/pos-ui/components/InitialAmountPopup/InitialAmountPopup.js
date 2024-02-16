import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Popup, Button, Input } from '@webkul/pos-ui';
import { showToast, getTodayDate, getCurrencyCode } from '~/utils/Helper';
import { db } from '~/models';
import { cashierActions } from '~/store/cashier';
import { useForm } from 'react-hook-form';
import { Trans, t } from '@lingui/macro';
import styles from '~/styles/Home/Home.module.scss';
import Router from 'next/router';

export const InitialAmountPopup = ({ initialPopup, change, inner = false }) => {
  const dispatch = useDispatch();
  // const cashierId = useSelector((state) => state.cashier.cashier.id);
  const [isInitial, setIsInitial] = useState(initialPopup);

  const { register, handleSubmit } = useForm();

  useEffect(() => {
    async function loadCashDrawer() {
      try {
        let cashDrawer = await db.cashDrawer.toArray();
        if (!cashDrawer.length) {
          setIsInitial(true);
          // change(setIsInitial);
        }
      } catch (err) {
        showToast({ type: 'error', message: err.message });
      }
    }
    loadCashDrawer();
  }, []);

  const toggleInitialAmt = () => {
    setIsInitial(!isInitial);
    change(setIsInitial);
  };

  const initialAmtSubmit = (data) => {
    const initialCashDrawer = {
      currency_code: getCurrencyCode(),
      date: getTodayDate(),
      created_at: getTodayDate(),
      initial_amount: data.initial_amount,
      base_initial_amount: data.initial_amount,
      is_synced: 0,
      remaining_amount: data.initial_amount,
      base_remaining_amount: data.initial_amount,
      transactions: [],
      note: null,
      status: 0,
      closed_at: false,
    };
    if (!data.initial_amount) {
      showToast({
        message: t`Please enter valid opening cash amount!!`,
        type: 'error',
      });
    } else {
      dispatch(cashierActions.initialAmount(initialCashDrawer));
      toggleInitialAmt();
      !inner && Router.push('/');
    }
  };

  return (
    <>
      <Popup>
        <form
          className={styles.popup_form}
          onSubmit={handleSubmit(initialAmtSubmit)}
        >
          <div className={styles.initialAmt}>
            <label>
              <Trans>Please enter the opening amount of cash drawer.</Trans>
            </label>
            <Input
              type="text"
              placeholder="Enter the initial amount"
              className="coupon_box"
              {...register('initial_amount')}
            />
            <div className="popup_action">
              {inner && (
                <Button
                  title={t`Later`}
                  btnClass={'button-cancel'}
                  clickHandler={toggleInitialAmt}
                />
              )}
              <Button
                title={t`Proceed`}
                btnClass={'button-proceed'}
                type="submit"
              />
            </div>
          </div>
        </form>
      </Popup>
    </>
  );
};
