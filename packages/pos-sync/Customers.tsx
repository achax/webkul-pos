import React, { FC } from 'react';
import { useQuery } from '@apollo/client';
import CUSTOMER_QUERY from '~/API/Customers.graphql';
import { db } from '~/models';
import { showToast, resetPosApp } from '~utils/Helper';
import { Trans } from '@lingui/macro';
interface ICustomersProps {
  triggerReqCompleted: Function;
  header: String | any;
}

export const Customers: FC<ICustomersProps> = ({
  triggerReqCompleted,
  header,
}) => {
  const { data, error } = useQuery(CUSTOMER_QUERY, {
    context: {
      headers: {
        'POS-TOKEN': header,
      },
    },
  });

  if (data && data.customerList) {
    db.customer
      .bulkPut(data.customerList.items)
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
      <Trans>Customers is Loading ...</Trans>
    </div>
  );
};
