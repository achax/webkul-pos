import React, { useState, useEffect } from 'react';
import { Button, Popup, Input } from '@webkul/pos-ui';
import { useForm } from 'react-hook-form';
import styles from '../PosCart/PosCart.module.scss';
import { Trans, t } from '@lingui/macro';
import { useDispatch } from 'react-redux';
import { cartActions } from '~/store/cart';
import { showToast, getCurrencySymbol } from '~/utils/Helper';

/**
 * Discount popup component
 * @param {object} props
 * @returns html
 */
const Discount = ({ discountPopup, cartPrice, change }) => {
  const [customProductPopup, setCustomProductPopup] = useState(discountPopup);
  const currency_symbol = getCurrencySymbol();
  const [discountSelect, setDiscountSelect] = useState(currency_symbol);
  const dispatch = useDispatch();

  useEffect(() => {
    setValue('type', discountSelect);
  }, [discountSelect, setValue]);

  /**
   * useForm Hook
   */
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const discountHandler = () => {
    discountSelect === currency_symbol
      ? setDiscountSelect('%')
      : setDiscountSelect(currency_symbol);
  };

  /**
   * Discount Submit Action
   * @param {Array} data
   */
  const discountSubmit = async (data) => {
    if (verifyDiscountAmount(data)) {
      if (data.discount > '0' && cartPrice > 0) {
        dispatch(cartActions.applyDiscount(data));
        showToast({ message: `Discount Applied!!`, type: 'success' });
        handleClose();
      } else {
        showToast({
          message: t`Please check cart or discount value`,
          type: 'error',
        });
      }
    }
  };

  /**
   * Verify discount amount
   *
   * @param {Number} data
   * @returns {Boolean}
   */
  const verifyDiscountAmount = (data) => {
    const discountType = data.type;
    if (discountType == '$') {
      return isValidDiscountAmount(data.discount);
    } else {
      const actualDiscountAmount = (cartPrice * data.discount) / 100;
      return isValidDiscountAmount(actualDiscountAmount);
    }
  };

  /**
   * To validate final discount amount
   *
   * @param {Number} amount
   * @returns {Boolean}
   */
  const isValidDiscountAmount = (amount) => {
    if (amount >= cartPrice) {
      showToast({
        message: t`Discount applied must be less than cart price.`,
        type: 'error',
      });
    } else {
      return true;
    }
  };

  /**
   * CustomProduct Close button
   */
  const handleClose = () => {
    setCustomProductPopup(!customProductPopup);
    change(customProductPopup);
  };
  return (
    <>
      {customProductPopup && (
        <Popup box="pop" close={handleClose}>
          <Popup box="discount" close={handleClose}>
            <form
              className={styles.popup_form}
              onSubmit={handleSubmit(discountSubmit)}
            >
              <div className={styles.discount_container}>
                <label>
                  <Trans>Add Discount </Trans>
                </label>
                <div className={styles.discount_input_section}>
                  <div className={styles.discount_input_section_options}>
                    <h1
                      className={
                        discountSelect === currency_symbol
                          ? styles.selected_option
                          : styles.default_option
                      }
                      onClick={discountHandler}
                    >
                      {currency_symbol}
                    </h1>
                    <h1
                      className={
                        discountSelect === currency_symbol
                          ? styles.default_option
                          : styles.selected_option
                      }
                      onClick={discountHandler}
                    >
                      %
                    </h1>
                  </div>

                  <Input
                    type="text"
                    placeholder=""
                    name="discountcart"
                    className="discount-cart"
                    {...register('discount', {
                      min: {
                        value: 1,
                        message: t`Must be a valid number !`,
                      },
                      pattern: {
                        value: /^(0|[1-9]\d*)(\.\d+)?$/,
                        message: t`Input must be number !`,
                      },
                      required: t`Input is required !`,
                    })}
                  />
                </div>

                <div className={styles.discount_input_section}>
                  <div className=""></div>
                  <div className="">
                    {errors?.discount && (
                      <div className="error m-0">{errors.discount.message}</div>
                    )}
                  </div>
                </div>
                <br />
                <div className={styles.discount_btn}>
                  <Button
                    title={t`Cancel`}
                    clickHandler={handleClose}
                    btnClass={styles.close_btn}
                  />

                  <Button
                    title={t`Proceed`}
                    btnClass="button-proceed"
                    type="submit"
                  />
                </div>
              </div>
            </form>
          </Popup>
        </Popup>
      )}
    </>
  );
};

export default Discount;
