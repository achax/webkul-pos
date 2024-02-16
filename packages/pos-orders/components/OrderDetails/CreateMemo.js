import React, { useState } from 'react';
import styles from './OrderItem.module.scss';
import { Trans, t } from '@lingui/macro';
import { getFormattedPrice, calculateDiscount } from '~/utils/Helper';
import { CreateMemoForm } from './CreateMemo/CreateMemoForm';

/**
 * Order Items
 * @param {object} item
 */
const CreateMemo = ({ item, currencyCode }) => {
  const [showDetails, setShowDetails] = useState(true);
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
    <CreateMemoForm>
      {({ register, watch, formState: { errors } }) => (
        <React.Fragment>
          <li className={`${styles.mb_10} `} key={item.id}>
            <div
              className={`${styles.cart_product} ${watch(`memo.${item.orderItemId}.return`)
                ? styles.bg_change
                : styles.bg_normal
                }`}
            >
              <div className={styles.cart_product_info}>
                <div
                  className={`${styles.cart_product_info_bar} ${styles.cart_product_info_border_radius}`}
                >
                  <div className={styles.cart_product_info_details}>
                    <div className={styles.cart_product_info_details_name}>
                      <div
                        className={
                          styles.cart_product_info_details_name_section
                        }
                      >
                        <input
                          className={styles.checked}
                          type="checkbox"
                          {...register(`memo.${item.orderItemId}.return`)}
                        />
                        <h2>{item.qty ? item?.qty : item?.quantity}</h2>
                        <h1>
                          <Trans>
                            {`${item.name && item.name.length <= 17
                              ? item.name
                              : !showDetails
                                ? `${item.name &&
                                item.name.slice(0, 17).concat('...')
                                }`
                                : item.name.slice(0, 17)
                              }`}
                          </Trans>
                        </h1>
                      </div>
                    </div>

                    <div className={styles.cart_product_info_details_price}>
                      <h1>{getFormattedPrice(parseFloat(baseSubtotal))}</h1>
                    </div>
                  </div>

                  <span
                    onClick={() => setShowDetails(!showDetails)}
                    className={
                      showDetails
                        ? 'icon iconbtn icon-chevron-right down transition'
                        : 'icon  iconbtn icon-chevron-right transition'
                    }
                  ></span>
                </div>
                {showDetails && (
                  <div className={watch(`memo.${item.orderItemId}.return`) ? styles.cart_product_info_options_unchecked : styles.cart_product_info_options}>
                    <div className={styles.cart_product_info_options_details}>
                      <h1 className={styles.quantity}>
                        <span> Order Quantity:</span>
                        <span className={styles.quantity_amount}>
                          {item.qty ? item?.qty : item?.quantity}
                        </span>
                      </h1>
                      {
                        watch(`memo.${item.orderItemId}.return`) ? (
                          <React.Fragment>
                            <div className={`${styles.update_quantity} `}>
                              <label htmlFor={`memo.${item.orderItemId}.qty $`}>
                                <Trans> Return Qty :</Trans>
                              </label>
                              <div
                                className={`${styles.quantity_amount} ${errors?.memo?.[item.orderItemId]?.qty?.message
                                  ? 'pb-15'
                                  : ''
                                  }`}
                              >
                                <input
                                  className={styles.field}
                                  type="number"
                                  min={1}
                                  max={item.qty}
                                  id={`memo.${item.orderItemId}.qty`}
                                  {...register(`memo.${item.orderItemId}.qty`, {
                                    max: {
                                      value: item.qty,
                                      message: t`Return quantity should be less than Ordered quantity`,
                                    },
                                    min: {
                                      value: 1,
                                      message: t`Return quantity should be greater than 0`,
                                    },
                                    value: item.qty,
                                  })}
                                />



                              </div>
                            </div>
                            {
                              errors?.memo?.[item.orderItemId]?.qty?.message && (
                                <span className={styles.error_}>
                                  {errors?.memo?.[item.orderItemId]?.qty?.message}
                                </span>
                              )
                            }
                            <div className={styles.backToOrder}>
                              <input
                                className={styles.checkedPrimary}
                                type="checkbox"
                                {...register(`memo.${item.orderItemId}.back_to_stock`)}
                              />
                              <span>Return to Stock </span>
                            </div>
                          </React.Fragment>
                        ) : ''
                      }
                      <div>
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
                    </div>

                    <div className={styles.cart_product_info_options_price}>
                      <div className={styles.options}>
                        <h1>
                          {item.discount > 0 &&
                            getFormattedPrice(
                              parseFloat(item?.price) * parseFloat(item?.qty),
                              currencyCode
                            )}
                        </h1>
                        <h1 >
                          {item.discount > 0 && `: (- ${item.discount}$)`}
                        </h1>
                      </div>

                      <div className={styles.options}>
                        <h2>
                          {item.taxAmount > 0 &&
                            getFormattedPrice(
                              parseFloat(
                                parseFloat(item?.price) * parseFloat(item?.qty)
                              ) - parseFloat(item?.discount),
                              currencyCode
                            )}
                        </h2>
                        <h2>
                          {item.taxAmount > 0 && `: (+ ${item.taxAmount}$)`}
                        </h2>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </li>
        </React.Fragment>
      )}
    </CreateMemoForm>
  );
};

export default CreateMemo;
