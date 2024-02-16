import React, { useState, useEffect } from 'react';
import { Button } from '@webkul/pos-ui';
import styles from './CouponItem.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { cartActions } from '~/store/cart';
import { operationsActions } from '~/store/operations';
import { showToast, isValidObject, isValidArray } from '~/utils/Helper';
import { t } from '@lingui/macro';

const CouponItem = ({ item }) => {
  const [isActive, setIsActive] = useState(false);
  const dispatch = useDispatch();
  const cartProducts = useSelector((state) => state.cart?.quote);
  const selectCoupan =
    cartProducts.applied_coupons && cartProducts.applied_coupons;

  const selectedCustomer = useSelector(
    (state) =>
      isValidObject(state?.customer) && state.customer?.selectedCustomer
  );

  useEffect(() => {
    selectCoupan ? setIsActive(true) : setIsActive(false);
  }, [isActive, selectCoupan]);

  const applyCoupon = (data) => {
    const isCouponCodeApplicable =
      isValidObject(data) &&
      isValidArray(data?.customer_group_ids) &&
      data?.customer_group_ids.find(
        (item) => item === selectedCustomer?.group_id
      );

    if (isCouponCodeApplicable) {
      const appliedCoupon = {
        rule_id: `${item.rule_id}`,
        coupon_code: item.coupon_code,
        from_date: item.from_date,
        to_date: item.to_date,
        simple_action: item.simple_action,
        discount_amount: item.discount_amount,
        is_active: item.is_active,
      };
      checkCartData(appliedCoupon);
    } else {
      showToast({
        type: 'warning',
        message: t`Select Coupon Code is not Applicable !!`,
      });
    }
  };

  const checkCartData = (appliedCoupon) => {
    if (cartProducts.items.length > 0) {
      dispatch(cartActions.applyCoupon(appliedCoupon));
      dispatch(operationsActions.setCouponStatus({ status: true }));
      setIsActive(!isActive);
    } else {
      showToast({ message: t`Cart Empty!!`, type: 'error' });
    }
  };

  return (
    <>
      <li className={styles.li_list}>
        <div className={styles.list_item}>
          <div>
            <p>{item.name}</p>
            <p className="coupon_description">{item.description}</p>
          </div>
          <Button
            title={
              selectCoupan && parseInt(selectCoupan.rule_id) === item.rule_id
                ? t`Already applied`
                : t`Apply`
            }
            btnClass={
              selectCoupan && parseInt(selectCoupan.rule_id) === item.rule_id
                ? 'button_applied'
                : 'button_apply'
            }
            buttonType="primary"
            clickHandler={() => applyCoupon(item)}
          />
        </div>
        <hr className={styles.hr_color} />
      </li>
    </>
  );
};

export default CouponItem;
