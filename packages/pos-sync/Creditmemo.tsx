import React, { FC } from 'react';
import { useQuery } from '@apollo/client';
import MEMO_LIST_QUERY from '~/API/Creditmemo.graphql';
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
export const Creditmemo: FC<IOrderListProps> = ({
  triggerReqCompleted,
  header,
}) => {
  const { data, error } = useQuery(MEMO_LIST_QUERY, {
    context: {
      headers: {
        'POS-TOKEN': header,
      },
    },
  });
  if (data && data.creditMemoList && data.creditMemoList.items) {
    db.creditMemo
      .bulkPut(data.creditMemoList.items)
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
      <Trans>Creditmemo is Loading ...</Trans>
    </div>
  );
};
