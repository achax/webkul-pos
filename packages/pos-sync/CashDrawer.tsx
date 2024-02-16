import React, { FC } from 'react';
import { useQuery } from '@apollo/client';
import CASH_DRAWER from '~/API/CashDrawer.graphql';
import { db } from '~/models';
import { showToast, resetPosApp } from '~utils/Helper';
import { Trans } from '@lingui/macro';
/**
 * ICashDrawerProps Interface
 */
interface ICashDrawerProps {
  triggerReqCompleted: Function;
  header: String | any;
}

/**
 * Coupons
 * @param triggerReqCompleted outletId
 * @returns coupon data
 */
export const CashDrawer: FC<ICashDrawerProps> = ({
  triggerReqCompleted,
  header,
}) => {
  const { data, error } = useQuery(CASH_DRAWER, {
    context: {
      headers: {
        'POS-TOKEN': header,
      },
    },
  });

  if (data && data.cashDrawersList.items) {
    db.cashDrawer
      .bulkPut(data.cashDrawersList.items)
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
      <Trans>CashDrawer is Loading ...</Trans>
    </div>
  );
};
