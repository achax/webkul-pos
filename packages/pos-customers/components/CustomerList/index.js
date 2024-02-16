import React, { useState, useEffect, useRef } from 'react';
import styles from '~/styles/Customer/Customer.module.scss';
import Image from 'next/image';
import { Input, ConfirmBox, Popup, NoDataAvailable } from '~/packages/pos-ui';
import { CustomerItem } from '@webkul/pos-customers';
import { db } from '~/models';
import { useDispatch, useSelector } from 'react-redux';
import { isValidArray, showToast, isValidObject } from '~utils/Helper';
import { useMutation } from '@apollo/client';
import DELETE_CUSTOMER from '~/API/mutation/DeleteCustomer.graphql';
import { customerActions } from '../../../../store/customer';
import { EditCustomer } from '~/packages/pos-customers';
import { useOfflineMode } from '~/hooks';
import { useAccessToken } from '~/hooks';
import { t } from '@lingui/macro';
import { useForm } from 'react-hook-form';
export const CustomerList = () => {
  const dispatch = useDispatch();
  const [filteredCustomer, setFilteredCustomer] = useState();
  const [customers, setCustomers] = useState();
  const [isConfirm, setIsConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { accessToken } = useAccessToken();
  const { register, watch } = useForm();
  const [deleteCustomer] = useMutation(DELETE_CUSTOMER, {
    context: {
      headers: {
        'POS-TOKEN': accessToken,
      },
    },
  });
  const selectedCustomer = useSelector(
    (state) => state.customer.selectedCustomer
  );
  const [loader, setLoader] = useState(false);
  const [editCustomerPopup, setEditCustomerPopup] = useState(false);
  const isCustomerChanged = useSelector(
    (state) => state.customer.isCustomerChanged
  );
  const { isAllowCustomEdit } = useOfflineMode();
  const offlineMode = useSelector((state) => state.offline?.appOffline);
  /**
   * delete Customer functionality
   */
  useEffect(() => {
    if (isSuccess) {
      setLoader(true);
      deleteCustomer({
        variables: { input: selectedCustomer?.entity_id },
      })
        .then((res) => {
          if (res?.data?.posDeleteCustomer?.status) {
            showToast({
              type: 'success',
              message: t`Customer is successfully deleted !!`,
            });
            removeCustomer(selectedCustomer);
          } else {
            showToast({ type: 'error', message: t`Customer is not found !!` });
          }
        })
        .catch(() => {
          showToast({
            type: 'error',
            message: t`Unable to Delete Customer !!`,
          });
        });

      setIsSuccess(!isSuccess);
      setIsConfirm(!isConfirm);
      setLoader(false);
    }
  }, [isSuccess, deleteCustomer, isConfirm, selectedCustomer]);
  const watchAllFields = watch();
  useEffect(() => {
    async function getCustomer() {
      const allCustomers = await db.customer.toArray();
      isAllowCustomEdit();
      if (allCustomers.length > 0) {
        setCustomers(allCustomers);
        if (!filteredCustomer) {
          setFilteredCustomer(() => mergeCustomerList(allCustomers));
        }
        if (isCustomerChanged) {
          setFilteredCustomer(() => mergeCustomerList(allCustomers));
        }
        dispatch(customerActions.setCustomerChangedStatus(!isCustomerChanged));
      }
    }
    if (!customers) getCustomer();
    if (isCustomerChanged) getCustomer();
    // -----------Debouncing search product----------//
    const timeoutId = setTimeout(() => {
      setFilteredCustomer(
        mergeCustomerList(
          isValidArray(customers) &&
          customers.filter(
            (customer) =>
              customer.name
                .toLowerCase()
                .includes(watchAllFields.search_pos_customer.toLowerCase()) ||
              customer?.email
                .toLowerCase()
                .includes(watchAllFields.search_pos_customer.toLowerCase())
          )
        )
      );
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [
    customers,
    filteredCustomer,
    selectedCustomer,
    dispatch,
    isAllowCustomEdit,
    isCustomerChanged,
    watchAllFields.search_pos_customer,
  ]);
  /**
   *
   * @param {Array} data
   * @returns {Array} uniqueCustomers
   *  managing the merging the CustomerList Items and remove duplicate data
   */
  const mergeCustomerList = (data) => {
    const uniqueCustomers = isValidArray(data) && [
      ...new Map(data.map((v) => [v.entity_id, v])).values(),
    ];
    return uniqueCustomers;
  };
  const handleEditCustomer = () => {
    setEditCustomerPopup(true);
  };
  const handleDeleteCustomer = () => {
    setIsConfirm(true);
  };

  const removeCustomer = async (selectedCustomer) => {
    if (isValidObject(selectedCustomer)) {
      try {
        db.customer.delete(selectedCustomer?.entity_id);
        dispatch(customerActions.clearCustomer());
        const customerList = await db.customer.toArray();
        dispatch(customerActions.clearCustomer());
        setFilteredCustomer(customerList);
        setCustomers(customerList);
      } catch (err) {
        console.error(err);
      }
    }
  };
  return (
    <>
      {selectedCustomer && selectedCustomer?.status && (
        <div className={styles.customer__details}>
          <div className={styles.customer__details__avtaar}>
            <div className="icon profile_icon icon-customer"></div>
          </div>
          <div className={styles.userInfo}>
            <div className={styles.user_details}>
              <h1>{`${selectedCustomer?.name}`}</h1>
              <h2>{selectedCustomer?.email}</h2>
              <h2>{selectedCustomer?.billing_telephone}</h2>
            </div>

            {!offlineMode ? (
              ''
            ) : (
              <div className={styles.action_btn_container}>
                <div
                  className={styles.action_btn}
                  onClick={handleDeleteCustomer}
                >
                  <span className="icon icon_action icon-delete "></span>
                  <span className={styles.action_btn_txt}>Delete</span>
                </div>
                <div className={styles.action_btn} onClick={handleEditCustomer}>
                  <span className="icon icon_action icon-edit"></span>
                  <span className={styles.action_btn_txt}>Edit</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className={styles.customer__customer_search}>
        <span className={styles.customer__searchicon}>
          <span className="icon icon-search"></span>
        </span>
        <Input
          type="search"
          placeholder="Search Customer name, email..."
          className="searchcustomer"
          {...register('search_pos_customer')}
        />
      </div>
      <div className={styles.customer__list}>
        {isValidArray(filteredCustomer) ? (
          filteredCustomer.map((item, index) => (
            <CustomerItem item={item} key={index} />
          ))
        ) : (
          <NoDataAvailable
            width={200}
            height={200}
            heading="Customer list is not available"
            isDescReq={true}
            descriptions="Please Add the Customer"
          />
        )}
      </div>
      {isConfirm && (
        <ConfirmBox
          isConfirmPopup={isConfirm}
          title="Confirmation"
          message={'Do you want to delete this Customer'}
          change={(isCheck) => setIsConfirm(!isCheck)}
          onSuccess={setIsSuccess}
        />
      )}
      {loader && (
        <Popup box="category">
          <div className={styles.loader}>
            <h1>Delete Customer !!</h1>
            <Image
              alt="loadericon"
              src="/assets/icons/square-loader-color.gif"
              width="100"
              height="50"
              priority={true}
            />
          </div>
        </Popup>
      )}
      {editCustomerPopup && (
        <EditCustomer
          CustomerPopup={editCustomerPopup}
          change={(isCheck) => setEditCustomerPopup(!isCheck)}
          customerList={customers}
        />
      )}
    </>
  );
};
