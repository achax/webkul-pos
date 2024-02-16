import React, { FC } from 'react';
import { useQuery } from '@apollo/client';
import TAX_RULE from '~/API/TaxRuleList.graphql';
import { showToast, resetPosApp } from '~utils/Helper';
import { Trans } from '@lingui/macro';
import { db } from '~/models';

/**
 * ITaxRuleList Interface
 */
interface ITaxRuleList {
  triggerReqCompleted: Function;
  header: String | any;
}

/**
 * Tax Rule
 * @param triggerReqCompleted outletId
 * @returns taxRuleList data
 */
export const TaxRuleList: FC<ITaxRuleList> = ({
  triggerReqCompleted,
  header,
}) => {
  const { data, error } = useQuery(TAX_RULE, {
    context: {
      headers: {
        'POS-TOKEN': header,
      },
    },
  });

  if (data && data.taxRuleList.items) {
    db.taxRuleList
      .bulkPut(data.taxRuleList.items)
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
    console.error(error);
    resetPosApp();
  }
  return (
    <div className="pos_sync_tab">
      <Trans>Tax Rule List is Loading ...</Trans>
    </div>
  );
};
