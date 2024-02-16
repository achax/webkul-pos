import React, { useState } from 'react';
import styles from './OrderItem.module.scss';
import { Trans } from '@lingui/macro';
import { getFormattedPrice, calculateDiscount } from '~/utils/Helper';

/**
 * Order Items
 * @param {object} item
 */
const OrderItem = (data) => {
  const [showDetails, setShowDetails] = useState(false);
  const item = data?.item;
  const productOptions =
    item.displayOption != null ? JSON.parse(item.displayOption) : '';

  const baseSubtotal = item?.baseSubtotal
    ? item?.baseSubtotal
    : calculateDiscount(
        item?.price,
        item?.discount > 0 ? item?.discount : 0,
        item?.discount_type
      );

  return (
    <React.Fragment>
      <li className={styles.mb_10} key={item.id}>
        <div className={styles.cart_product}>
          <div className={styles.cart_product_info}>
            <div
              className={`${
                !showDetails
                  ? `${styles.cart_product_info_bar}${styles.cart_product_info_border_radius}`
                  : `${styles.cart_product_info_bar} ${styles.cart_product_info_isActive}`
              }`}
            >
              <div className={styles.cart_product_info_details}>
                <div className={`${styles.cart_product_info_details_name}`}>
                  <div
                    onClick={() => setShowDetails(!showDetails)}
                    className={
                      showDetails
                        ? 'icon m-auto icon_action icon-chevron-right down transition'
                        : 'icon m-auto icon_action icon-chevron-right transition'
                    }
                  ></div>
                  <div
                    className={styles.cart_product_info_details_name_section}
                  >
                    <h2>{item.qty ? item?.qty : item?.quantity}</h2>
                    <h1>
                      <Trans>
                        <span dangerouslySetInnerHTML={{ __html: item.name }} />
                      </Trans>
                    </h1>
                  </div>
                </div>

                <div className={styles.cart_product_info_details_price}>
                  <h1>{getFormattedPrice(parseFloat(baseSubtotal))}</h1>
                </div>
              </div>
            </div>

            {showDetails && (
              <div
                className={`${styles.cart_product_info_options}  ${styles.cart_product_info_OptTsActive}`}
              >
                <div className={styles.cart_product_info_options_details}>
                  <h6>
                    <Trans>
                      {`${
                        item?.name?.length > 17
                          ? ` - ${item?.name?.slice(17, item?.name?.length)}`
                          : ''
                      }`}
                    </Trans>
                  </h6>
                  <h1>{`${getFormattedPrice(item?.price)}/unit`}</h1>
                  <h1>Quantity : {item.qty ? item?.qty : item?.quantity}</h1>
                  <span>
                    {productOptions &&
                      Object.entries(productOptions).map((item, index) => (
                        <p key={index}>
                          {item[0].toLowerCase() +
                            ' : ' +
                            item[1].toLowerCase()}
                        </p>
                      ))}
                  </span>
                </div>

                <div className={styles.cart_product_info_options_price}>
                  <div className={styles.options}>
                    <h1>
                      {item.discount > 0 &&
                        getFormattedPrice(
                          parseFloat(item?.price) * parseFloat(item?.qty),
                          data?.currencyCode
                        )}
                    </h1>
                    <h1>{item.discount > 0 && `: (- ${item.discount}$)`}</h1>
                  </div>

                  <div className={styles.options}>
                    <h2>
                      {item.taxAmount > 0 &&
                        getFormattedPrice(
                          parseFloat(
                            parseFloat(item?.price) * parseFloat(item?.qty)
                          ) - parseFloat(item?.discount),
                          data?.currencyCode
                        )}
                    </h2>
                    <h2>{item.taxAmount > 0 && `: (+ ${item.taxAmount}$)`}</h2>
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

export default OrderItem;
