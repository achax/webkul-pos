import React, { useState, useEffect } from 'react';
import styles from '~/styles/Invoice/Invoice.module.scss';
import Image from 'next/image';
import { db } from '~models';
import { Trans } from '@lingui/macro';

const Invoice = () => {
  const [orders, setOrders] = useState();
  const [filteredOrder, setFilteredOrder] = useState();

  /**
   * return orderList from DB
   */
  useEffect(() => {
    async function getOrderData() {
      const allOrders = await db.orderList
        .where('synchronized')
        .notEqual(1)
        .toArray();
      if (allOrders.length > 0) {
        setOrders(allOrders);
        if (!filteredOrder) setFilteredOrder(allOrders);
      }
    }
    if (!orders) getOrderData();
  }, [orders, filteredOrder]);

  return (
    <div className={styles.invoice}>
      <section className={styles.section}>
        <div className={styles.wrapper}>
          <div className={styles.head}>
            <label className={styles.title}>
              <Trans>Tax Invoice / Bill of supply</Trans>
            </label>
            <div className={styles.logo}>
              <Image
                alt="login_user"
                src="/assets/images/logo.png"
                width="50"
                height="50"
              />
            </div>
            <label className={styles.address}>India</label>
          </div>
          <div className={styles.ordertop}>
            <div style={styles.order_id}>
              <label>Order - #90</label>
              <label>Date - 11/12/2022</label>
              <label>Customer - John Doe</label>
            </div>
            <div style={styles.orderaddress}>
              <label>Noida East, Webkul</label>
              <label>Noida, UP, India</label>
              <label>Tel - 9999999999</label>
            </div>
          </div>
          <div className={styles.orderList}>
            <div className={styles.orderHead}>
              <ul>
                <li>
                  <div className={styles.head}>
                    <div>Product Name</div>
                    <div>Unit Price</div>
                    <div>Quantity</div>
                    <div>Total Price</div>
                  </div>
                </li>
                {/* commented this code, because it gives warning in build time and also unused file */}
                {/* {filteredOrder &&
                  filteredOrder.map((item, index) => (
                    <InvoiceOrderItem items={item.items} key={index} />
                  ))}
                {!filteredOrder && (
                  <li>
                    <div className={styles.error}>No Offline Orders</div>
                  </li>
                )} */}
              </ul>
            </div>
          </div>
          <div className={styles.orderSubtotal}>
            <div className={styles.blank}></div>
            <div className={styles.details}>
              <label>Subtotal : </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Invoice;

/**
 * Generate at build time.
 *
 * @returns {JSON} props
 */
export async function getStaticProps() {
  return {
    props: {
      twoColumnLayout: true,
    },
  };
}
