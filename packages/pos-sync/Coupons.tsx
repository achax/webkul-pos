import React, { FC } from 'react';
import { useQuery } from '@apollo/client';
import COUPONS_QUERY from '~/API/Coupons.graphql';
import { db } from '~/models';
import { showToast, resetPosApp } from '~utils/Helper';
import { Trans } from '@lingui/macro';
/**
 * ICategoryProps Interface
 */
interface ICouponsProps {
  triggerReqCompleted: Function;
  header: String | any;
}

/**
 * Coupons
 * @param triggerReqCompleted outletId
 * @returns coupon data
 */
export const Coupons: FC<ICouponsProps> = ({ triggerReqCompleted, header }) => {
  const { data, error } = useQuery(COUPONS_QUERY, {
    context: {
      headers: {
        'POS-TOKEN': header,
      },
    },
  });

  if (data && data.cartRuleList.items) {
    db.coupons
      .bulkPut(data.cartRuleList.items)
      .then(() => {
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
      <Trans>Coupons is Loading ...</Trans>
    </div>
  );
};
