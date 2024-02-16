import React from 'react';
import styles from './TodayCash.module.scss';
import {
  getFormattedPrice,
  getFormattedTime,
  isValidArray,
} from '~/utils/Helper';
import { t } from '@lingui/macro';

/**
 * CashItem component
 * @param item as props
 * @returns Cash Item
 */
const CashItem = ({ header, transactions }) => {
  const getPaymentType = (item) => {
    let cartData = JSON.parse(item.payment_info_data);
    return cartData?.cardAmount && !cartData?.cashAmount
      ? 'Card'
      : cartData?.cashAmount && !cartData?.cardAmount
        ? 'Cash'
        : cartData?.cashAmount && cartData?.cashAmount
          ? 'Card ,Cash'
          : 'N/A';
  };
  let transaction = isValidArray(transactions) && [...transactions].reverse();
  return (
    <table className={styles.table_list}>
      <tbody className={styles.table_header}>
        <tr>
          {header &&
            header.map((item, index) => {
              return <td key={index}>{item}</td>;
            })}
        </tr>
      </tbody>
      <tbody className={styles.table_item}>
        {transaction
          ? transaction?.map((item, index) => {
            return (
              <tr key={index}>
                <td>#{item.incrementId}</td>
                <td>
                  {item.date ? getFormattedTime(item?.date) : t`No time save`}
                </td>
                <td>
                  {item.grand_total
                    ? getFormattedPrice(item.grand_total)
                    : `$0.00`}
                </td>
                <td>{getPaymentType(item)}</td>
              </tr>
            );
          })
          : null}
      </tbody>
    </table>
  );
};
export default CashItem;
