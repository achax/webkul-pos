import React, { useState, useEffect } from 'react';
import styles from '~/styles/Checkout/Checkout.module.scss';
import { Input, NumPad } from '@webkul/pos-ui';
import { showToast, isValidAmount } from '~/utils/Helper';
import { checkoutActions } from '~/store/checkout';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { t } from '@lingui/macro';

/**
 * cashpay component
 * @returns
 */
export const CashPay = () => {
  const dispatch = useDispatch();
  const [calAmount, setCalAmount] = useState('');

  const {
    register,
    // handleSubmit,
    setFocus,
    // formState: { errors },
  } = useForm();

  useEffect(() => {
    setFocus('amount');
  }, [setFocus]);

  /**
   * handle onChnage and set calAmount
   * @param {e}
   */
  const handleChange = (e) => {
    // checking the validity of entered amount

    let amount = `${e?.target?.value}`;

    if (!isValidAmount(amount.charAt(0))) {
      showToast({ type: 'warning', message: 'Enter payable amount' });
    } else {
      setCalAmount(e.target.value.trim());
    }
  };

  /**
   * hanlde number click and set calAmount
   * @param {e}
   */

  const handleNumbleClick = (e) => {
    try {
      // checking the validity of entered amount

      let amount = `${calAmount}`.concat(e?.currentTarget?.innerText).trim();

      if (!isValidAmount(amount.charAt(0))) {
        showToast({ type: 'warning', message: 'Enter payable amount' });
      } else {
        if (calAmount === 0) {
          setCalAmount(e.currentTarget.innerText.trim());
        } else if (e?.currentTarget?.innerText === undefined) {
          setCalAmount(calAmount);
        } else {
          setCalAmount(calAmount + e.currentTarget.innerText.trim());
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * clear the calAmount
   */
  const handleClear = () => {
    setCalAmount('');
  };

  /**
   * Cash submit and dispatch reducers for setCash
   */
  const cashSubmit = () => {
    calAmount == 0
      ? showToast({
          message: t`Value Empty!!`,
          type: 'error',
        })
      : '';
    dispatch(checkoutActions.setCash(calAmount));
    handleClear();
  };

  /**
   * Handle back button
   */
  const handleBack = () => {
    calAmount > 0
      ? setCalAmount(calAmount.slice(0, -1))
      : showToast({
          message: t`Value Empty!!`,
          type: 'error',
        });
  };

  /**
   * form with amount and submit form
   */
  return (
    <>
      <Input
        type="number"
        name={'calculateAmount'}
        placeholder="0"
        className={styles.total_templ}
        value={calAmount}
        onChange={handleChange}
        autoFocus={true}
        {...register('amount', { required: t`This field is required !!` })}
      />
      <NumPad
        btnEvent={handleNumbleClick}
        back={handleBack}
        clear={handleClear}
        submit={cashSubmit}
      />
    </>
  );
};
