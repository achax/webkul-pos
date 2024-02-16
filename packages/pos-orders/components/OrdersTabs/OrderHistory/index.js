import { Input, NoDataAvailable } from '@webkul/pos-ui';
import React, { useState, useEffect, useRef } from 'react';
import styles from '../OrderHistory.module.scss';
import OrderItems from './OrderItems';
import { db } from '~models';
import { useDispatch, useSelector } from 'react-redux';
import { orderItemActions } from '~/store/orderItem';
import { isValidArray, isValidJson } from '~utils/Helper';
import { TabList } from './TabList';
import { useOfflineMode, usePosSync } from '~/hooks';
import { t, Trans } from '@lingui/macro';

const TABS = [
  {
    id: 1,
    title: 'Online Orders',
  },
  {
    id: 2,
    title: 'Offline Orders',
  },
];

/**
 * get order history list
 * @returns order history data
 */
export const OrderHistory = () => {
  const [orders, setOrders] = useState();
  const [filteredOrder, setFilteredOrder] = useState();
  const dispatch = useDispatch();
  const SearchRef = useRef();
  const selectedOrder = useSelector((state) => state.orderItem?.orderItemData);
  const [activeId, setActiveId] = useState(1);
  const { offlineModeEnable } = useOfflineMode();
  const { syncingPosApp } = usePosSync();

  /**
   * get all order data and set data into state
   */
  useEffect(() => {
    async function getOrderData() {
      const allOrders = await db.orderList.toArray();

      if (allOrders.length > 0) {
        setOrders(allOrders);
        if (!filteredOrder) setFilteredOrder(() => mergeOrderList(allOrders));
      }
      dispatch(orderItemActions.clearOrderItem(null));
    }
    if (!orders) getOrderData();
  }, [orders, filteredOrder, dispatch, activeId]);

  const handleSearch = () => {
    const searchValue = SearchRef.current.value;

    if (isValidArray(filteredOrder)) {
      setFilteredOrder(
        mergeOrderList(
          orders.filter((order) =>
            (order.increment_id + '').includes(searchValue)
          )
        )
      );
    }

    if (searchValue === '') {
      setFilteredOrder(orders);
    }
  };

  /**
   *
   * @param {Array} data
   * @returns {Array} uniqueOrderList
   *  managing the merging the OrderItems and remove duplicate data
   */

  const mergeOrderList = (data) => {
    let filteredOrders =
      isValidArray(data) &&
      data.filter(
        (item) =>
          item?.payment_info_data &&
          isValidJson(item?.payment_info_data) &&
          item?.order_id &&
          (activeId === 1 ? item?.synchronized === 1 : item?.synchronized === 0)
      );

    let uniqueOrderList = isValidArray(filteredOrders) && [
      ...new Map(filteredOrders.map((v) => [v.increment_id, v])).values(),
    ];
    let sortedOrders =
      isValidArray(uniqueOrderList) &&
      uniqueOrderList.sort((a, b) =>
        a.increment_id < b.increment_id ? 1 : -1
      );

    return sortedOrders;
  };

  const handleTabChange = (item) => {
    setActiveId(item?.id);
    setOrders(false);
    setFilteredOrder(false);
  };

  return (
    <div className={styles.order_history_container}>
      {offlineModeEnable === '0' ? (
        ''
      ) : (
        <div className={styles.order_options}>
          {isValidArray(TABS) && (
            <TabList
              TABS={TABS}
              onChange={(item) => {
                handleTabChange(item);
              }}
              activeId={activeId}
            />
          )}
          {/* {activeId === 2 &&
            offlineModeEnable === '1' &&
            isValidArray(filteredOrder) && (
              <Button
                title="Sync all Orders"
                buttonType="primary"
                iconClass="icon-refresh"
                iconBefore
                hasIcon
                clickHandler={syncingPosApp}
              />
            )} */}
        </div>
      )}

      <div
        className={
          offlineModeEnable === '0'
            ? styles.orderhistory_list_mode
            : styles.orderhistory_list
        }
      >
        <div className={styles.order_search}>
          <span className={styles.searchicon}>
            <span className="icon icon-search"></span>
          </span>
          <Input
            type="text"
            name="search-pos-order"
            placeholder={t`Enter Order Id...`}
            className="searchorder"
            onChange={handleSearch}
            ref={SearchRef}
          />
        </div>
        <div className={styles.orderList}>
          <div className={styles.orderHead}>
            <ul>
              <li>
                <div className={styles.head}>
                  <div>
                    <Trans>Order ID</Trans>
                  </div>
                  <div>
                    <Trans>Date</Trans>
                  </div>
                  <div>
                    <Trans>Total Sales</Trans>
                  </div>
                </div>
              </li>
              {filteredOrder &&
                filteredOrder.map((item, index) => (
                  <OrderItems
                    item={item}
                    key={index}
                    isSelected={
                      selectedOrder?.increment_id === item?.increment_id
                        ? true
                        : false
                    }
                  />
                ))}

              {!filteredOrder && (
                <>
                  <li>
                    <div className={styles.error}>
                      <NoDataAvailable
                        width={200}
                        height={200}
                        isDescReq={true}
                        heading={t`Order Item is not available`}
                        descriptions={t`Pls Add the Order in the Order Cart`}
                      />
                    </div>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
