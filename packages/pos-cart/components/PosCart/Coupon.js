import React, { useState, useEffect } from 'react';
import { Button, Popup } from '@webkul/pos-ui';
import { useForm } from 'react-hook-form';
import styles from './PosCart.module.scss';
import { Trans, t } from '@lingui/macro';
import { CouponsList } from '@webkul/pos-coupon';
import { useSelector } from 'react-redux';
import { isValidArray } from '~utils/Helper';
import { db } from '~models';
import {
  showToast,
} from '~/utils/Helper';
/**
 * Coupon popup component
 * @param {object} props
 * @returns html
 */

const Coupon = ({ couponPopup, change }) => {
  const [isCouponPopup, setIsCouponPopup] = useState(couponPopup);
  const [coupons, setCoupons] = useState();
  const coupon = useSelector((state) => state.operations?.operations);
  const cartProducts = useSelector((state) => state.cart?.quote);
  /**
   * coupon length
   */
  useEffect(() => {
    async function getCoupons() {
      const allCoupons = await db.coupons.toArray();

      if (allCoupons.length > 0) {
        setCoupons(() => mergeCoupons(allCoupons));
        return allCoupons;
      }
    }
    if (!coupons) getCoupons();
  }, [coupons]);

  const mergeCoupons = (data) => {
    const coupons =
      isValidArray(data) &&
      data.filter(
        (item) =>
          item?.coupon_code !== null &&
          (item?.simple_action === 'by_fixed' ||
            item?.simple_action === 'by_percent')
      );
    return coupons;
  };
  useEffect(() => {
    coupon.couponStatus ? handleClose() : '';
  });
  /**
   * useForm Hook
   */
  const {
    handleSubmit,
    formState: { errors },
  } = useForm();
  /**
   * Coupon Submit Action
   * @param {Array} data
   */
  const couponSubmit = async () => {

    if (cartProducts?.applied_coupons) {
      handleClose();
    } else {
      showToast({
        type: 'error',
        message: t`Have not any selected coupon !!`,
      });
    }
  };
  /**
   * Coupon Close button
   */
  const handleClose = () => {
    setIsCouponPopup(!isCouponPopup);
    change(!isCouponPopup);
  };
  return (
    <>
      {isCouponPopup && (
        <Popup close={handleClose}>
          <form
            className={styles.popup_form}
            onSubmit={handleSubmit(couponSubmit)}
          >
            <div className={styles.newproduct_form}>
              <label>
                <Trans>Select Coupon</Trans>
              </label>
              {errors.coupon && (
                <p className="error">{errors.coupon.message}</p>
              )}
              <div className="popup_list">
                <CouponsList change={setIsCouponPopup} />
              </div>
              <div className="popup_action">
                <Button
                  title={t`Cancel`}
                  btnClass="button-cancel"
                  clickHandler={handleClose}
                />
                {Boolean((!(coupons && coupons?.length <= 0)) && (cartProducts && cartProducts?.items?.length > 0)) && (
                  <Button
                    title={t`Proceed`}
                    btnClass="button-proceed"
                    type="submit"
                  />
                )}

              </div>
            </div>
          </form>
        </Popup>
      )}
    </>
  );
};
export default Coupon;
