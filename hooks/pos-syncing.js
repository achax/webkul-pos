import { useOfflineMode } from './offline-mode-checker';
import PLACE_ORDER from '~API/mutation/PosPlaceOrder.graphql';
import SAVE_HOLD_ORDERS from '~/API/mutation/SaveHoldOrders.graphql';
import REMOVE_HOLD_ORDER from '~/API/mutation/RemoveHoldOrder.graphql';
import SAVE_CASH_DRAWER from '~/API/mutation/SaveCashDrawer.graphql';
import { useMutation } from '@apollo/client';
import {
  isValidArray,
  getFormattedOrderList,
  getHoldOrder,
  isValidObject,
  getFormattedCashDrawer,
  showToast,
} from '~utils/Helper';
import { useEffect, useState } from 'react';
import { db } from '~/models';
import { usePosDetail } from './pos-app-handler';
import { useAccessToken } from './access-token';
import {updateProductQty} from '@webkul/pos-products/hooks/product-handler'

export function usePosSync() {
  const { offlineModeEnable } = useOfflineMode();
  const { appName } = usePosDetail();
  const { accessToken } = useAccessToken();
  const [errorOccured, setErrorOccured] = useState(false);
  const {afterOrderPlace} = updateProductQty()
  /**
   * offlineModeEnable Worked in the enum manner.
   * 0 : Offline disable
   * 1 : Offline Enable with Internet Connectivity
   * 2 : Offline Enable with Without Internet Connectivity
   */

  const [placeOrder] = useMutation(PLACE_ORDER, {
    context: {
      headers: {
        'POS-TOKEN': accessToken,
      },
    },
  });

  const [saveHoldOrders] = useMutation(SAVE_HOLD_ORDERS, {
    context: {
      headers: {
        'POS-TOKEN': accessToken,
      },
    },
  });

  const [deleteHoldOrder] = useMutation(REMOVE_HOLD_ORDER, {
    context: {
      headers: {
        'POS-TOKEN': accessToken,
      },
    },
  });
  const [saveCashDrawer] = useMutation(SAVE_CASH_DRAWER, {
    context: {
      headers: {
        'POS-TOKEN': accessToken,
      },
    },
  });

  const [loader, setLoader] = useState(false);
  const [syncAllow, setSyncAllow] = useState(false);

  const [nonSyncCount, setNonSyncCount] = useState({
    holdOrder: 0,
    orderList: 0,
    cashDrawer: 0,
  });

  useEffect(() => {
    const getNonSyncDataCount = async () => {
      const orderList = await db.orderList.toArray();
      const holdOrderList = await db.holdCart.toArray();
      const cashDrawerList = await db.cashDrawer.toArray();

      const nonSyncOrderList = orderList.filter(
        (item) => item?.synchronized === 0
      );
      const nonSyncHoldOrderList = holdOrderList.filter(
        (item) => item?.synchronized === 0 && !item?.isDeleted
      );
      /**
       * Filter the non_synced cashDrawer and also
       * Filter the Today CashDrawer (because Today cashDrawer don't need to closed the syncing process)
       */
      const nonSyncCashDrawer =
        isValidArray(cashDrawerList) &&
        cashDrawerList.filter((item) => item?.is_synced === 0);

      setNonSyncCount({
        holdOrder: isValidArray(nonSyncHoldOrderList)
          ? nonSyncHoldOrderList.length
          : 0,
        orderList: isValidArray(nonSyncOrderList) ? nonSyncOrderList.length : 0,
        cashDrawer: isValidArray(nonSyncCashDrawer)
          ? nonSyncCashDrawer.length
          : 0,
      });
    };

    getNonSyncDataCount();
  }, [loader, syncAllow]);

  const handleFunCallOnPosMode = (onlineFunc, offlineFunc) => {
    if (offlineModeEnable === '0' || offlineModeEnable === '1') {
      onlineFunc();
    } else {
      offlineFunc();
    }
  };

  const syncingOrderList = async () => {
    const orderList = await db.orderList.toArray();
    const nonSyncOrderList = orderList.filter(
      (item) => item?.synchronized === 0
    );

    let orderListData = [];

    if (isValidArray(nonSyncOrderList)) {
      await Promise.all(
        nonSyncOrderList.map((item) =>
          placeOrder({
            variables: { input: getFormattedOrderList(item) },
          }).then((res) => {
            const orderData = res?.data?.posPlaceOrder
            if (isValidObject(orderData)) {
              orderListData.push(orderData);
              afterOrderPlace(orderData)
            }
          })
        )
      )
        .then((err) => {
          if (isValidArray(orderListData)) {
            db.transaction('rw', db.orderList, async () => {
              orderListData?.map(async (item) => {
                await db.orderList
                  .where('increment_id')
                  .equals(parseFloat(item?.place_order_data?.pos_order_id))
                  .modify({
                    order_id: item?.place_order_data?.order_id,
                    increment_id: item?.place_order_data?.increment_id,
                    synchronized: 1,
                  });
              });
            });
          }
        })
        .catch((err) => {
          console.error(err), setErrorOccured(true);
        });
    }
  };

  const syncingHoldOrderList = async () => {
    const holdOrderList = await db.holdCart.toArray();
    const nonSyncHoldOrderList = holdOrderList.filter(
      (item) => item?.synchronized === 0 && !item?.isDeleted
    );

    let holdOrderListData = [];

    if (isValidArray(nonSyncHoldOrderList)) {
      await Promise.all(
        nonSyncHoldOrderList?.map((item) =>
          saveHoldOrders({
            variables: {
              input: getHoldOrder(item),
            },
          }).then((res) => {
            if (res?.data && isValidObject(res?.data?.saveHoldOrders)) {
              holdOrderListData.push({
                hold_order_data: item,
                id: res?.data?.saveHoldOrders?.id,
              });
            }
          })
        )
      )
        .then(() => {
          if (isValidArray(holdOrderListData)) {
            db.transaction('rw', db.holdCart, async () => {
              holdOrderListData?.map(async (item) => {
                await db.holdCart
                  .where('id')
                  .equals(parseFloat(item?.hold_order_data?.id))
                  .modify({
                    id: item?.id,
                    synchronized: 1,
                  });
              });
            });
          }
        })
        .catch((err) => {
          console.error(err), setErrorOccured(true);
        });
    }
  };

  const syncingRemoveHoldOrder = async () => {
    const holdCart = await db.holdCart.toArray();
    const nonSyncRemoveHoldCart =
      isValidArray(holdCart) &&
      holdCart.filter(
        (item) => item?.isDeleted == 1 && item?.synchronized === 1
      );

    if (isValidArray(nonSyncRemoveHoldCart)) {
      await Promise.all(
        nonSyncRemoveHoldCart.map((item) =>
          deleteHoldOrder({
            variables: {
              input: item?.id,
            },
          })
        )
      )
        .then((res) => {})
        .catch((err) => {
          console.error(err), setErrorOccured(true);
        });
    }
  };

  const syncingSaveCashDrawer = async () => {
    const cashDrawerList = await db.cashDrawer.toArray();

    const nonSyncCashDrawer =
      isValidArray(cashDrawerList) &&
      cashDrawerList.filter((item) => item?.is_synced === 0);

    const orderList = await db.orderList.toArray();

    if (isValidArray(nonSyncCashDrawer)) {
      await Promise.all(
        nonSyncCashDrawer.map((item) =>
          saveCashDrawer({
            variables: {
              input: getFormattedCashDrawer(item, orderList),
            },
          })
        )
      )
        .then((res) => {
          db.transaction('rw', db.cashDrawer, async () => {
            await db.cashDrawer
              .where('is_synced')
              .equals(0)
              .modify({ is_synced: 1 });
          }).catch((error) => {
            console.error('IndexedDB: ' + error);
          });
        })
        .catch((err) => {
          console.error(err), setErrorOccured(true);
        });
    }
  };

  const syncingPosApp = async () => {
    if (
      nonSyncCount?.cashDrawer > 0 ||
      nonSyncCount?.orderList > 0 ||
      nonSyncCount?.holdOrder > 0
    ) {
      setLoader(true);
      await syncingRemoveHoldOrder();
      await syncingHoldOrderList();
      await syncingOrderList();
      await syncingSaveCashDrawer();
      setLoader(false);
      if (errorOccured) {
        showToast({
          type: 'error',
          message: `${appName} is unable to synced ||`,
        });
        return;
      }
      if (!errorOccured) {
        showToast({
          type: 'success',
          message: `${appName} is synced Successfully !!`,
        });
      }
    } else {
      showToast({
        type: 'warning',
        message: `${appName} is already synced !!`,
      });
    }
  };

  return {
    handleFunCallOnPosMode,
    loader,
    syncingPosApp,
    nonSyncCount,
    setSyncAllow,
  };
}
