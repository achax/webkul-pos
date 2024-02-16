import React, { FC } from 'react';
import { useQuery } from '@apollo/client';
import PRODUCTS_QUERY from '~/API/Products.graphql';
import { db } from '~/models';
import { showToast, resetPosApp } from '~utils/Helper';
import { Trans } from '@lingui/macro';
import { getLocalStorage, CASHIER_LOGIN_STORE_KEY } from '~store/local-storage';

interface IProductProps {
  triggerReqCompleted: Function;
  header: String | any;
}

export const Products: FC<IProductProps> = ({
  triggerReqCompleted,
  header,
}) => {
  const { data, error } = useQuery(PRODUCTS_QUERY, {
    context: {
      headers: {
        'POS-TOKEN': header,
        'store': getLocalStorage(CASHIER_LOGIN_STORE_KEY) ?? 'default'
      },
    },
  });

  if (data && data.posProductList.items) {
    db.products
      .bulkPut(data.posProductList.items)
      .then(() => {
        triggerReqCompleted();
      })
      .catch((error) => {
        console.log(JSON.parse(JSON.stringify(error)));
      });
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
      <Trans>Products is Loading ...</Trans>
    </div>
  );
};
