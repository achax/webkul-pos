import React from 'react';
import styles from '../TodayCash/TodayCash.module.scss';
import {
  getFormattedPrice,
  getFormattedDate,
  isValidArray,
  convertIntoParse,
} from '~/utils/Helper';

/**
 * Order Items
 * @param {date,cash,other,total,note}
 * @returns
 */
const SaleItem = ({ data, header }) => {
  /**
   *
   * @param {Object} cashierAmount
   * @returns {Int} cardAmount
   */

  function getOtherPayReceived(cashierAmount) {
    return (
      isValidArray(cashierAmount?.transactions) &&
      cashierAmount?.transactions.reduce((accumulator, object) => {
        return (
          accumulator +
          parseInt(
            convertIntoParse(object['payment_info_data'])?.cardAmount === null
              ? 0
              : convertIntoParse(object['payment_info_data'])?.cardAmount
          )
        );
      }, 0)
    );
  }

  /**
   *
   * @param {Object} cashierAmount
   * @returns  {Int} cashAmount
   */
  function getCashReceived(cashierAmount) {
    return (
      isValidArray(cashierAmount?.transactions) &&
      cashierAmount?.transactions.reduce((accumulator, object) => {
        return (
          accumulator +
          parseInt(
            convertIntoParse(object['payment_info_data'])?.cashAmount === null
              ? 0
              : convertIntoParse(object['payment_info_data'])?.cashAmount
          )
        );
      }, 0)
    );
  }

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
        {data
          ? data.map((item, index) => {
              return (
                <tr key={index}>
                  <td>
                    {item ? getFormattedDate(item?.date, false) : '00.00.00'}
                  </td>
                  <td>
                    {item
                      ? getFormattedPrice(getCashReceived(item))
                      : getFormattedPrice(0)}
                  </td>
                  <td>
                    {item
                      ? getFormattedPrice(getOtherPayReceived(item))
                      : getFormattedPrice(0)}
                  </td>
                  <td>{item?.note ? item?.note : '--'}</td>
                  <td>
                    {item?.closed_at
                      ? getFormattedDate(item?.closed_at, false)
                      : '--'}
                  </td>
                </tr>
              );
            })
          : null}
      </tbody>
    </table>
  );
};

export default SaleItem;
