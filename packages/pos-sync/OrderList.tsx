import React, { FC } from 'react';
import { useQuery } from '@apollo/client';
import ORDER_LIST_QUERY from '~/API/OrderList.graphql';
import { db } from '~/models';
import { showToast, resetPosApp } from '~utils/Helper';
import { Trans } from '@lingui/macro';
/**
 * ICategoryProps Interface
 */
interface IOrderListProps {
  triggerReqCompleted: Function;
  header: String | any;
}

/**
 * Orders
 * @param triggerReqCompleted outletId
 * @returns Orders data
 */
export const OrderList: FC<IOrderListProps> = ({
  triggerReqCompleted,
  header,
}) => {
  const { data, error } = useQuery(ORDER_LIST_QUERY, {
    context: {
      headers: {
        'POS-TOKEN': header,
      },
    },
  });

  if (data && data.ordersList && data.ordersList.items) {
    db.orderList
      .bulkPut(data.ordersList.items)
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
      <Trans>Orders is Loading ...</Trans>
    </div>
  );
};
