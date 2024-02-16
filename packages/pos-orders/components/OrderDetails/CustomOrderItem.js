import React, { useState } from 'react';
import styles from './OrderItem.module.scss';
import { Trans } from '@lingui/macro';
import {
  getFormattedPrice,
  isValidObject,
  // calculateDiscount,
} from '~/utils/Helper';

/**
 * Order Items
 * @param {object} item
 */
const CustomOrderItem = (data) => {
  const [showDetails, setShowDetails] = useState(false);
  const item = data?.item;

  const orderDetails =
    isValidObject(item?.pos_custom_option) && item?.pos_custom_option;

  return (
    <React.Fragment>
      <li className={styles.mb_10} key={item.id}>
        <div className={styles.cart_product}>
          <div className={styles.cart_product_info}>
            <div className={styles.cart_product_info_bar}>
              <div className={styles.cart_product_info_details}>
                <div className={styles.cart_product_info_details_name}>
                  <span
                    onClick={() => setShowDetails(!showDetails)}
                    className={
                      showDetails
                        ? 'icon icon-right-angle down transition'
                        : 'icon icon-right-angle transition'
                    }
                  ></span>

                  <div
                    className={styles.cart_product_info_details_name_section}
                  >
                    <h2>
                      {orderDetails.quantity
                        ? orderDetails?.quantity
                        : orderDetails?.qty
                          ? orderDetails?.qty
                          : 0}
                    </h2>
                    <h1>
                      <Trans>
                        {`${orderDetails.name && orderDetails.name.length <= 17
                            ? orderDetails.name
                            : !showDetails
                              ? `${orderDetails.name &&
                              orderDetails.name.slice(0, 17).concat('...')
                              }`
                              : orderDetails.name.slice(0, 17)
                          }`}
                      </Trans>
                    </h1>
                  </div>
                </div>

                <div className={styles.cart_product_info_details_price}>
                  <h1>
                    {item?.baseSubtotal > 0
                      ? getFormattedPrice(item?.baseSubtotal)
                      : getFormattedPrice(0)}
                  </h1>
                </div>
              </div>
            </div>

            {showDetails && (
              <div className={styles.cart_product_info_options}>
                <div className={styles.cart_product_info_options_details}>
                  <h6>
                    <Trans>
                      {`${orderDetails?.name?.length > 17
                          ? ` - ${orderDetails?.name?.slice(
                            17,
                            orderDetails?.name?.length
                          )}`
                          : ''
                        }`}
                    </Trans>
                  </h6>
                  <h5>{`${getFormattedPrice(
                    orderDetails?.price,
                    data?.currencyCode
                  )}/unit`}</h5>
                  <h1>
                    Order Quantity - {item.qty ? item?.qty : item?.quantity}
                  </h1>

                </div>

                <div className={styles.cart_product_info_options_price}>
                  <div className={styles.options}>
                    <h1>
                      {item.discount > 0 &&
                        getFormattedPrice(
                          parseFloat(orderDetails.price) *
                          parseFloat(item.qty ? item?.qty : item?.quantity),
                          data?.currencyCode
                        )}
                    </h1>
                    <h1> {item.discount > 0 && `: - (${item.discount}$)`}</h1>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </li>
    </React.Fragment>
  );
};

export default CustomOrderItem;
