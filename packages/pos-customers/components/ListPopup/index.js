import React, { useEffect, useState } from 'react';
import { Popup } from '@webkul/pos-ui';
import { CustomerList } from '@webkul/pos-customers';
import styles from '~/packages/pos-ui/components/Popup/Popup.module.scss';
import { useSelector } from 'react-redux';

/**
 * AddCustomer popup component
 * @param {object} props
 * @returns html
 */
export const ListPopup = ({ isList, change }) => {
  const [isCustomerList, setIsCustomerList] = useState(isList);
  const selectedCustomerStatus = useSelector(
    (state) => state.customer?.customerPop?.status
  );

  useEffect(() => {
    if (selectedCustomerStatus) {
      setIsCustomerList(false);
      change(isCustomerList);
    }
  }, [selectedCustomerStatus ,change, isCustomerList]);

  const handleClose = React.useCallback(() => {
    setIsCustomerList(!isCustomerList);
    change(setIsCustomerList);
  }, [isCustomerList, change])

  return (
    <>
      {isCustomerList && (
        <Popup close={handleClose}  box="invoice" >
            <div className="">
              <div className={styles.header}>
                <label className={styles.title}>Select Customer</label>
                <span
                  style={{ paddingRight: '15px' }}
                  className={`${styles.deleteIcon} pr-3 icon icon-x-circle-black`}
                  onClick={handleClose}
                ></span>
              </div>
              <div className={styles.customer_list}>
                <CustomerList />
              </div>
            </div>
        </Popup>
      )}
    </>
  );
};
