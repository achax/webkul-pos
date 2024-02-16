import React, { FC } from 'react';
import { useQuery } from '@apollo/client';
import HOLD_CART from '~/API/HoldCart.graphql';
import { db } from '~/models';
import { showToast, resetPosApp } from '~utils/Helper';
import { Trans } from '@lingui/macro';
/**
 * ICategoryProps Interface
 */
interface IHoldCartProps {
  triggerReqCompleted: Function;
  header: String | any;
}

/**
 * Coupons
 * @param triggerReqCompleted outletId
 * @returns coupon data
 */
export const HoldCart: FC<IHoldCartProps> = ({
  triggerReqCompleted,
  header,
}) => {
  const { data, error } = useQuery(HOLD_CART, {
    context: {
      headers: {
        'POS-TOKEN': header,
      },
    },
  });

  if (data && data.holdOrdersList.items) {
    db.holdCart
      .bulkPut(data.holdOrdersList.items)
      .then((res) => {
        triggerReqCompleted();
      })
      .catch((error) => console.log(error));
  }
  if (error) {
    showToast({
      type: 'error',
      message: JSON.parse(JSON.stringify(error)).message,
    });
    resetPosApp();
  }
  return (
    <div className="pos_sync_tab">
      <Trans>HoldCart is Loading ...</Trans>
    </div>
  );
};
