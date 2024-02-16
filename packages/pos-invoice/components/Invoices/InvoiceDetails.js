import React from 'react';
import styles from './InvoiceOrderItem.module.scss';
import { getFormattedPrice } from '~/utils/Helper';

/**
 * Order Items
 * @param {object} items
 */
const InvoiceDetails = ({ items, currencyCode }) => {
  return (
    <React.Fragment>
      {items &&
        items?.price !== null &&
        items.map((item, index) => (
          <li className={styles.mb_10} key={index}>
            <div className={styles.order_product}>
              <div className="p-10 item-width">
                <span>
                  <span>{item.name}</span>
                  {item.displayOption &&
                    Object.entries(JSON.parse(item.displayOption)).map(
                      (item, index) => (
                        <span className={styles.product_options} key={index}>
                          {item[0] + ' : ' + item[1]}
                        </span>
                      )
                    )}
                </span>
              </div>

              <div>
                <span className={styles.customDiscount}>
                  {item.discount > 0 &&
                    `${getFormattedPrice(
                      parseFloat(item?.price) *
                        parseFloat(
                          item.qty
                            ? item?.qty
                            : item?.quantity
                            ? item?.quantity
                            : 0
                        )
                    )} : (- ${getFormattedPrice(item.discount)})`}
                </span>
                <span>
                  {item?.taxAmount > 0 &&
                    `${getFormattedPrice(
                      parseFloat(item?.price) - parseFloat(item?.discount)
                    )} : (+ ${item?.taxAmount})`}
                </span>
              </div>
              <div>
                <span className={styles.cart_price}>
                  {item.qty ? item?.qty : item?.quantity ? item?.quantity : 0}
                </span>
              </div>
              <div className="p-10 item-width">
                <span className={styles.cart_price}>
                  {item.baseSubtotal !== null || item?.baseSubTotal !== null
                    ? getFormattedPrice(
                        item.baseSubtotal
                          ? item?.baseSubtotal
                          : item?.baseSubTotal
                          ? item?.baseSubTotal
                          : 0,
                        currencyCode
                      )
                    : getFormattedPrice(0, currencyCode)}
                </span>
              </div>
            </div>
          </li>
        ))}
    </React.Fragment>
  );
};

export default InvoiceDetails;
