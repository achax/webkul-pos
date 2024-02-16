import React, { FC } from 'react';
import { useQuery } from '@apollo/client';
import TAX_RATE from '~/API/TaxRateList.graphql';
import { showToast, resetPosApp } from '~utils/Helper';
import { Trans } from '@lingui/macro';
import { db } from '~/models';

/**
 * ITaxRateList Interface
 */
interface ITaxRateList {
  triggerReqCompleted: Function;
  header: String | any;
}

/**
 * Tax Rate List
 * @param triggerReqCompleted outletId
 * @returns taxRateList data
 */
export const TaxRateList: FC<ITaxRateList> = ({
  triggerReqCompleted,
  header,
}) => {
  const { data, error } = useQuery(TAX_RATE, {
    context: {
      headers: {
        'POS-TOKEN': header,
      },
    },
  });

  if (data && data.taxRateList.items) {
    db.taxRateList
      .bulkPut(data.taxRateList.items)
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
      <Trans>Tax Rate List is Loading ...</Trans>
    </div>
  );
};
