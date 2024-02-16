import React from 'react';
import { useQuery } from '@apollo/client';
import STORE_CONFIG_QUERY from '~/API/StoreConfig.graphql';
import { db } from '~/models';
import { useDispatch } from 'react-redux';
import { configActions } from '~/store/config';
import { showToast, resetPosApp, isValidObject } from '~utils/Helper';
import { offlineModeAction } from '~store/offlineMode';
import { Trans } from '@lingui/macro';
import { getLocalStorage, CASHIER_LOGIN_STORE_KEY } from '~store/local-storage';

// CASHIER_LOGIN_STORE_KEY
export const StoreConfig = ({
  triggerReqCompleted,
  header,
}: {
  triggerReqCompleted: Function;
  header: String | any;
}) => {
  const { data, error } = useQuery(STORE_CONFIG_QUERY, {
    context: {
      headers: {
        'POS-TOKEN': header,
        'store':getLocalStorage(CASHIER_LOGIN_STORE_KEY)??'default'
      },
    },
  });

  const dispatch = useDispatch();

  if (data && data.storeConfig) {
    db.storeConfig
      .put(data.storeConfig)
      .then(() => {
        dispatch(configActions.setConfig(data.storeConfig));
        if (isValidObject(data?.storeConfig)) {
          dispatch(
            offlineModeAction.setOfflineEnability(
              data?.storeConfig?.enableoffline
            )
          );
        }
        triggerReqCompleted();
      })
      .catch((error) => {
        console.log(error), console.log(error);
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
      <Trans>Store Configuration is Loading ...</Trans>
    </div>
  );
};
