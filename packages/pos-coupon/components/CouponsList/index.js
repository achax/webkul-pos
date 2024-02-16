import React, { useEffect, useState } from 'react';
import { PlaceHolder } from '@webkul/pos-ui';
import { db } from '~models';
import styles from './Coupons.module.scss';
import CouponItem from './CouponItem';
import { isValidArray } from '~utils/Helper';
import { Trans } from '@lingui/macro';
/**
 * Get Coupon list
 * @returns
 */
export const CouponsList = () => {
  const [coupons, setCoupons] = useState();
  /**
   * Get category data from DB
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
  return (
    <React.Fragment>
      {coupons === null && (
        <PlaceHolder
          customPlaceHolderClass={styles.category_selector}
          count={12}
          grid={true}
          imageWidth="100px"
          imageHeight="100px"
          hasDescription={false}
          hasMeta={false}
        />
      )}
      <nav className={styles.coupon_wrapper}>
        {
          <ul>
            {coupons &&
              coupons.map((couponItem, index) => (
                <CouponItem item={couponItem} key={index} />
              ))}
            {coupons && coupons.length <= 0 && (
              <h4>
                <Trans>Coupons is not available</Trans>
              </h4>
            )}
          </ul>
        }
      </nav>
    </React.Fragment>
  );
};
