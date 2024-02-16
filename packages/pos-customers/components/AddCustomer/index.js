import React, { useState, useEffect } from 'react';
import { Button, Popup, Input } from '@webkul/pos-ui';
import { useForm } from 'react-hook-form';
import styles from '~/styles/Customer/Customer.module.scss';
import { Trans, t } from '@lingui/macro';
import { useDispatch } from 'react-redux';
import { customerActions } from '~/store/customer';
import CREATE_CUSTOMER from '~API/mutation/CreateCustomer.graphql';
import { useMutation } from '@apollo/client';
import { showToast, isValidObject } from '~utils/Helper';
import { useAccessToken } from '~/hooks';

/**
 * AddCustomer popup component
 * @param {object} props
 * @returns html
 */
export const AddCustomer = ({ CustomerPopup, change }) => {
  const [isCustomer, setIsCustomer] = useState(CustomerPopup);
  const dispatch = useDispatch();
  const { accessToken } = useAccessToken();

  const [createCustomer, { loading }] = useMutation(CREATE_CUSTOMER, {
    onError: (err) => console.error(err),
    onCompleted: () =>
      showToast({
        type: 'success',
        message: t`Customer is created successfully !!`,
      }),

    context: {
      headers: {
        'POS-TOKEN': accessToken,
      },
    },
  });

  useEffect(() => {
    setFocus('name');
  }, [setFocus]);

  useEffect(() => {
    setIsCustomer(CustomerPopup);
  }, [CustomerPopup]);
  /**
   * useForm Hook
   */
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm();

  /**
   * Customer Submit Action
   * @param {Object} data
   */

  const customerSubmit = async (customerData) => {
    createCustomer({
      variables: {
        input: customerData,
      },
    })
      .then((res) => {
        if (
          isValidObject(res.data?.posCreateCustomer) &&
          res?.data?.posCreateCustomer?.customer
        ) {
          dispatch(
            customerActions.addCustomer(res?.data?.posCreateCustomer?.customer)
          );
          dispatch(customerActions.setCustomerChangedStatus(true));
          handleClose();
        } 
      })
      .catch((err) => {
        console.error(err);
      });
  };

  /**
   * Barcode Close button
   */
  const handleClose = () => {
    setIsCustomer(!isCustomer);
    change(isCustomer);
  };

  return (
    <>
      {isCustomer && (
        <Popup box="customer" close={handleClose}>
          <form
            className={styles.popup_form}
            onSubmit={handleSubmit(customerSubmit)}
          >
            <div className={styles.newproduct_form}>
              <label>
                <Trans>Add New Customer </Trans>
              </label>
              <hr className="divider" />

              <div className={styles.cutomer_name_form}>
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

                <div className={styles.customer_name}>
                  <h4>
                    <Trans>Password</Trans>
                    <span className="form-required"> *</span>
                  </h4>
                  <Input
                    type="password"
                    placeholder={t`Enter the Password`}
                    name="name"
                    className="name"
                    {...register('password', {
                      required: t`This field is required`,
                      minLength: {
                        value: 8,
                        message: t`Password must be at least 8 characters long!`,
                      },
                    })}
                  />
                  {errors.password && (
                    <p className="error">{errors.password.message}</p>
                  )}
                </div>

                <div className={styles.customer_email}>
                  <h4>
                    <Trans>Mobile Number</Trans>
                    <span className="form-required"> *</span>
                  </h4>
                  <Input
                    type="text"
                    placeholder={t`Enter Mobile Number`}
                    name="phone_number"
                    className="phone_number"
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

                <div className={styles.customer_email}>
                  <h4>
                    <Trans>Email</Trans>
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
                </div>

                <div className="popup_action">
                  <Button
                    title={t`Cancel`}
                    btnClass="button-cancel"
                    clickHandler={handleClose}
                  />
                  <Button
                    title={t`Add`}
                    loading={loading}
                    btnClass="button-proceed"
                    type="submit"
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
