import React from 'react';
import { Button } from '@webkul/pos-ui';
import { t } from '@lingui/macro';
// import styles from './PosCart.module.scss';

const CouponList = ({ list }) => {
  const handleCouponClick = (item) => {};

  return (
    <>
      <li className="li_list">
        <div className="list-item">
          <div>
            <p>{list.title}</p>
            <p className="coupon_description">{list.description}</p>
          </div>
          <Button
            title={t`Apply`}
            btnClass={'button-apply'}
            buttonType="primary"
            clickHandler={handleCouponClick}
          />
        </div>
        <hr />
      </li>
    </>
  );
};

export default CouponList;
