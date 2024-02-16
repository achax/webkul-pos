import { Button } from '@webkul/pos-ui';
import React from 'react';
import styles from './OrderHold.module.scss';
import { getFormattedDate } from '~utils/Helper';
import { Trans, t } from '@lingui/macro';

const OrderHoldItem = ({ item, removeOrder, resumeOrder }) => {
  const items = item && item.items;

  return (
    <>
      {item && (
        <div className={styles.order_display}>
          <div className={styles.order_details}>
            <h4>
              <Trans>Hold Order</Trans>
            </h4>
            <div className={styles.datetimeorder}>
              <div className={styles.hold_date}>
                {item.date && getFormattedDate(item?.date)}
              </div>
            </div>
          </div>
          <div className={styles.hold_note}>
            <h4>
              <Trans>Note</Trans>
            </h4>
            <p>{item.note}</p>
          </div>
          <div className={styles.table_responsive}>
            {items &&
              items[0] !== null &&
              items.map((item, index) => (
                <div key={index} className={styles.item_list}>
                  <li>
                    {item.name} <br />
                    {item?.product_option && item?.displayOption !== null
                      ? Object.entries(JSON.parse(item?.displayOption)).map(
                          ([key, value]) => {
                            return (
                              <>
                                <span className={styles.product_options}>
                                  {`${key} : ${value}`}
                                </span>
                              </>
                            );
                          }
                        )
                      : ''}
                  </li>
                  <li>{item.qty}</li>
                </div>
              ))}
          </div>
          <div className={styles.order_display_action}>
            <Button
              title={t`Resume`}
              btnClass="success"
              buttonType="success"
              clickHandler={() => resumeOrder(item)}
              hasIcon={true}
              iconClass="icon-arrow-right-circle"
              iconBefore={true}
            />
            <Button
              title={t`Remove`}
              btnClass="lights"
              iconClass="icon icon-delete "
              clickHandler={() => removeOrder(item)}
              hasIcon={true}
              iconBefore={true}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default OrderHoldItem;
