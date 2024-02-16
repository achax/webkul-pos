import React from 'react';
import { useQuery } from '@apollo/client';
import STORE_LIST from '~/API/StoreList.graphql';
import { db } from '~/models';
import { Trans } from '@lingui/macro';
export const StoreList = ({
  triggerReqCompleted,
  header,
}: {
  triggerReqCompleted: Function;
  header: String | any;
}) => {
  const { data } = useQuery(STORE_LIST, {
    context: {
      headers: {
        'POS-TOKEN': header,
      },
    },
  });

  if (data && data.storeList) {
    db.storeList
      .put(data.storeList)
      .then(() => {
        triggerReqCompleted();
      })
      .catch((error) => console.log(error));
  }
  return (
    <div className="pos_sync_tab">
      <Trans>Store List is Loading ...</Trans>
    </div>
  );
};
