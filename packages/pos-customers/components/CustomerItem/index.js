import React from 'react';
import styles from './CustomerItem.module.scss';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { customerActions } from '~/store/customer';

/**
 * Customer item component
 * @param {item}
 * @returns customerItem
 */
export const CustomerItem = ({ item }) => {
  const dispatch = useDispatch();
  const handleCustomer = () => {
    dispatch(customerActions.setCustomer(item));
    dispatch(customerActions.setCustomerSelectStatus(true));
  };

  return (
    <>
      <div className={styles.customeritem} onClick={handleCustomer}>
        <li className={styles.customerList}>
          <div className={styles.customer__avatar}>
            <Image
              alt="search"
              width={40}
              height={40}
              src="/assets/images/login-user.png"
            />
          </div>
          <div className={styles.metainfo}>
            <h5>{item.name}</h5>
            <p>{item.email}</p>
          </div>
        </li>
      </div>
    </>
  );
};
