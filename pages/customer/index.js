import React, { useState } from 'react';
import styles from '~/styles/Customer/Customer.module.scss';
import { cartProduct } from '~/utils/carts';
import { Button } from '~/packages/pos-ui';
import { CustomerList, AddCustomer } from '@webkul/pos-customers';
import { PosCart } from '@webkul/pos-cart';
import { useSelector } from 'react-redux';
import { t } from '@lingui/macro';
const Customer = () => {
  const [isCustomerPopup, setIsCustomerPopup] = useState(false);
  const offlineMode = useSelector((state) => state.offline?.appOffline);

  const toggleCustomerPopup = () => {
    setIsCustomerPopup(!isCustomerPopup);
  };

  return (
    <div className={styles.customer}>
      <section className={styles.customer__info_section}>
        <div className={styles.customer__head}>
          <h3 className={styles.customer__title}>{'Customers'}</h3>
          {offlineMode && (
            <Button
              title={t`Add Customer`}
              hasIcon={true}
              iconClass="icon-add-white"
              iconBefore={true}
              btnClass={styles.customer__add_customer}
              clickHandler={toggleCustomerPopup}
            />
          )}
        </div>
        <div className={styles.customer_list_container}>
          <CustomerList />
        </div>
      </section>

      <PosCart cartProduct={cartProduct} />

      {isCustomerPopup && (
        <AddCustomer
          CustomerPopup={isCustomerPopup}
          change={(isCheck) => setIsCustomerPopup(!isCheck)}
        />
      )}
    </div>
  );
};

export default Customer;

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
