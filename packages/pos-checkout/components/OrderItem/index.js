import React, { useState } from 'react';
import styles from './OrderItem.module.scss';
import { Trans } from '@lingui/macro';
import { getFormattedPrice, textAdj } from '~/utils/Helper';
import { usePosTax } from '~/hooks';
import { TAX_METHOD_UNIT_BASE } from '~utils/Constants';

/**
 * Order Items
 * @param {object} item
 */
export const OrderItem = ({ item }) => {
  const [showDetails, setShowDetails] = useState(false);
  const {
    taxRate,
    productCalculationMethod,
    ruleProductTaxClass,
    storeProductTaxClass,
  } = usePosTax();

  const productOptions =
    item.product_option != null ? JSON.parse(item.displayOption) : '';

  const cartItemTax =
    ruleProductTaxClass == item?.taxClassId &&
    storeProductTaxClass == ruleProductTaxClass &&
    productCalculationMethod == TAX_METHOD_UNIT_BASE
      ? (parseFloat(taxRate) / 100) * parseFloat(item?.subtotal)
      : parseFloat(0);

  const cartItemPrice = parseFloat(cartItemTax) + parseFloat(item?.subtotal);

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
                    <h2>{item.qty}</h2>
                    <h1>
                      <Trans>
                        {!showDetails
                          ? textAdj(item.name)
                          : textAdj(item.name, false)}
                      </Trans>
                    </h1>
                  </div>
                </div>
                <div className={styles.cart_product_info_details_price}>
                  <h1>{getFormattedPrice(cartItemPrice)}</h1>
                </div>
              </div>
            </div>

            {showDetails && (
              <div className={styles.cart_product_info_options}>
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
                  <h3>{`Quantity : ${item?.qty}`}</h3>
                  <h3>
                    {productOptions &&
                      Object.entries(productOptions).map((item, index) => (
                        <p key={index}>
                          {item[0].toLowerCase() +
                            ' : ' +
                            item[1].toLowerCase()}
                        </p>
                      ))}
                  </h3>
                </div>

                <div className={styles.cart_product_info_options_container}>
                  <div className={styles.cart_product_info_options_price}>
                    <div
                      className={styles.cart_product_info_options_price_option}
                    >
                      {item.discount > 0 && item.price ? (
                        <>
                          <h1>
                            {item.discount > 0
                              ? getFormattedPrice(
                                  parseFloat(item?.price) *
                                    parseFloat(item?.qty)
                                )
                              : ''}
                          </h1>
                          <h1>
                            {item.discount > 0 &&
                              `- ${item.discount}(${item.discount_type})`}
                          </h1>
                        </>
                      ) : (
                        ''
                      )}
                    </div>

                    <div
                      className={styles.cart_product_info_options_price_option}
                    >
                      {cartItemTax > 0 && (
                        <>
                          <h1>{getFormattedPrice(item?.subtotal)}</h1>
                          <h1>{`+${taxRate}(%)`}</h1>
                        </>
                      )}
                    </div>
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
