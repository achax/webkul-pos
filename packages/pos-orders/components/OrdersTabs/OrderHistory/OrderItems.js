import React from 'react';
import { useDispatch } from 'react-redux';
import styles from '../OrderHistory.module.scss';
import { orderItemActions } from '~/store/orderItem';
import {
  getFormattedPrice,
  getFormattedDate,
  isValidObject,
} from '~/utils/Helper';

const OrderItems = ({ item, isSelected }) => {
  const dispatch = useDispatch();
  /**
   * handle order click and set OrderItem object for dispatch
   */
  const handleOrderClick = () => {
    const orderItem = {
      increment_id: item.increment_id,
      order_id: item.pos_order_id,
      date: item.date && getFormattedDate(item?.date),
      status: item.status,
      item: [...item.items, { currency_code: item?.currency_code }],
      grandtotal_discount: item.grandtotal_discount,
      coupon_code: isValidObject(item.coupon_info[0])
        ? item?.coupon_info[0]
        : {},
      tax: item.tax,
      cash_received: item.cash_received,
      cash_returned: item.cash_returned,
      grand_total: item.grand_total,
      magento_order_id: item?.order_id,
      payment_info_data: item.payment_info_data,
      synchronized: item.synchronized,
      discount: item?.discount,
      grandDiscountAmt: item?.grandtotal_discount,
      message: item?.message,
      customer: item?.customer,
      currency_code: item?.currency_code,
      subTotal: item?.sub_total
        ? item?.sub_total
        : item?.base_sub_total
        ? item?.base_sub_total
        : 0,
    };

    dispatch(orderItemActions.setOrderItem(orderItem));
  };

  return (
    <li>
      <div
        className={isSelected ? styles.listItem_highlighted : styles.listItem}
        onClick={handleOrderClick}
      >
        <div className={styles.orderid}>{`#${item.increment_id}`}</div>
        <div className={styles.dateBox}>
          {item.date ? getFormattedDate(item?.date, false) : ''}
        </div>
        <div className={styles.priceBox}>
          {getFormattedPrice(item.grand_total, item?.currency_code)}
        </div>
      </div>
    </li>
  );
};

export default OrderItems;
