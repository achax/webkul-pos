import React, { useState, useEffect } from 'react';
import { Button, Popup, Input } from '@webkul/pos-ui';
import { useForm } from 'react-hook-form';
import styles from '~/styles/Customer/Customer.module.scss';
import { Trans, t } from '@lingui/macro';
import { useDispatch } from 'react-redux';
import { customerActions } from '~/store/customer';
import UPDATE_CUSTOMER_DETAILS from '~API/mutation/UpdateCustomerDetails.graphql';
import { useMutation } from '@apollo/client';
import { showToast, isValidObject, isValidString } from '~utils/Helper.js';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { db } from '~/models';
import { useAccessToken } from '~/hooks';

/**
 * AddCustomer popup component
 * @param {object} props
 * @returns html
 */
export const EditCustomer = ({ CustomerPopup, change }) => {
  const [isCustomer, setIsCustomer] = useState(CustomerPopup);
  const dispatch = useDispatch();
  const selectedCustomer = useSelector(
    (state) => state.customer.selectedCustomer
  );
  const router = useRouter();
  const { accessToken } = useAccessToken();

  /**
   * useForm Hook
   */

  const {
    register,
    handleSubmit,
    setFocus,
    setValue,
    formState: { errors },
  } = useForm();

  const [updateCustomerDetails, { loading }] = useMutation(
    UPDATE_CUSTOMER_DETAILS,
    {
      onError: (err) =>console.err(err),
      onCompleted: () =>
        showToast({
          type: 'success',
          message: t`Customer is updated successfully !!`,
        }),

      context: {
        headers: {
          'POS-TOKEN': accessToken,
        },
      },
    }
  );

  useEffect(() => {
    setFocus('name');
  }, [setFocus]);

  /**
   * Customer is not selected case handle
   */
  useEffect(() => {
    if (!selectedCustomer || !selectedCustomer.name) {
      router.replace('/customer');
    }
  }, [router, selectedCustomer]);

  /**
   * Managing the edit customer detail form
   */
  useEffect(() => {
    if (isValidObject(selectedCustomer)) {
      const name =
        isValidString(selectedCustomer?.name) &&
        selectedCustomer?.name.split(' ');
      if (isValidString(name)) {
        isValidString(name[0]) && setValue('firstname', name[0]);
        isValidString(name[0]) && setValue('lastname', name[1]);
        isValidString(selectedCustomer.phone_number) &&
          setValue('phone_number', selectedCustomer?.phone_number);
          isValidString(selectedCustomer.email) &&
          setValue('email', selectedCustomer?.email);
        }
    }
  }, [selectedCustomer, setValue]);
  /**
   * Customer Submit Action
   * @param {Object} data
   */
  const customerSubmit = async (customerData) => {
    if (isValidObject(selectedCustomer) && selectedCustomer?.email) {
      let customer = Object.assign(customerData, {
        email: selectedCustomer?.email,
        id: selectedCustomer.entity_id,
      });
      updateCustomerDetails({
        variables: {
          input: customer,
        },
      })
        .then(async (res) => {
          if (
            isValidObject(res.data?.posUpdateCustomer) &&
            res?.data?.posUpdateCustomer?.customer
          ) {
            db.customer.update(
              res?.data?.posUpdateCustomer?.customer.entity_id,
              res?.data?.posUpdateCustomer?.customer
            );

            dispatch(
              customerActions.setCustomer(
                res?.data?.posUpdateCustomer?.customer
              )
            );

            dispatch(customerActions.setCustomerSelectStatus(true));
            dispatch(customerActions.setCustomerChangedStatus(true));
            handleClose();
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  /**
   * Barcode Close button
   */
  const handleClose = () => {
    setIsCustomer(!isCustomer);
    change(isCustomer);
  };
    //todo: have to add it with password and mail 
  return (
    <>
      {isCustomer && (
        <Popup style={{ padding: '20px' }} box="customer" close={handleClose}>
          <form
            className={`${styles.customer_form} `}
            onSubmit={handleSubmit(customerSubmit)}
          >
            <div className={styles.newproduct_form}>
              <label className={''} style={{ fontSize: '18px' }}>
                <Trans>Edit Customer </Trans>
              </label>
              <hr />

              <div>
                <div className={styles.customer_name}>
                  <h4>
                    <Trans>First Name</Trans>
                    <span className="form-required"> *</span>
                  </h4>
                  <Input
                    type="text"
                    placeholder={t`Enter the First Name`}
                    name="name"
                    className="name"
                    {...register('firstname', {
                      required: t`This field is required`,
                    })}
                  />
                  {errors?.firstname && (
                    <p className="error">{errors?.firstname?.message}</p>
                  )}
                </div>

                <div className={styles.customer_name}>
                  <h4>
                    <Trans>Last Name</Trans>
                    <span className="form-required"> *</span>
                  </h4>
                  <Input
                    type="text"
                    placeholder={t`Enter the Last Name`}
                    name="name"
                    className="name"
                    {...register('lastname', {
                      required: t`This field is required`,
                    })}
                  />
                  {errors.lastname && (
                    <p className="error">{errors.lastname.message}</p>
                  )}
                </div>
              
                {/* <div className={styles.customer_email}>
                  <h4>
                    <Trans>Email </Trans>
                    <span className="form-required"> *</span>
                  </h4>
                        <Input
                    type="text"
                    placeholder={t`Enter Email`}
                    name="email"
                    className="email"
                    {...register('email', {
                      required: t`This field is required`,
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: t`Please Enter the valid email`,
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="error">{errors.email.message}</p>
                  )}
                </div> */}
                <div className={styles.customer_email}>
                  <h4>
                    <Trans>Mobile Number</Trans>
                    <span className="form-required"> *</span>
                  </h4>
                  <Input
                    type="text"
                    placeholder={t`Enter Mobile Number`}
                    name="phone_number"
                    className="phone_no"
                    {...register('phone_number', {
                      required: t`This field is required`,
                      pattern: {
                        value: /^([+]\d{2})?\d{10}$/,
                        message: t`Phone number must be 10 digit number`,
                      },
                    })}
                  />
                  {errors.phone_number && (
                    <p className="error">{errors.phone_number.message}</p>
                  )}
                </div>

                <div className="popup_action">
                  <Button
                    title={t`Cancel`}
                    btnClass="button-cancel"
                    clickHandler={handleClose}
                  />
                  <Button
                    title={t`Update`}
                    btnClass="button-proceed"
                    type="submit"
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          </form>
        </Popup>
      )}
    </>
  );
};
