import React, { useState } from 'react';
import styles from '~/styles/Pay/Pay.module.scss';
import { Input, Popup, Button } from '@webkul/pos-ui';
import { Trans, t } from '@lingui/macro';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { customerActions } from '~/store/customer';

/**
 * Add customer Popup component
 * @param {array} state
 * @returns html
 */
export const AddCustomer = ({ props }) => {
  /**
   * define state for check popup
   */
  const [isCustomerPopup, setIsCustomerPopup] = useState(props);
  const dispatch = useDispatch();

  /**
   * useForm hooks variables
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  /**
   * manage customer submit and dispatch reducers for update customer data
   * @param {data}
   */
  const customerSubmit = async (data) => {
    dispatch(customerActions.setCustomer(data));
    setIsCustomerPopup(!isCustomerPopup);
  };

  /**
   * Popup Close button
   */
  const handleClose = () => {
    setIsCustomerPopup(!isCustomerPopup);
  };

  return (
    <>
      {isCustomerPopup && (
        <Popup>
          <form
            className={styles.popup_form}
            onSubmit={handleSubmit(customerSubmit)}
          >
            <div className={styles.newproduct_form}>
              <label className=" mb-15 ">
                <Trans>Add New Customer</Trans>
              </label>
              <hr />
              <div className={styles.customer_name}>
                <h4>
                  <Trans>Name</Trans>
                  <span className="form-required"> *</span>
                </h4>
                <Input
                  type="text"
                  placeholder={t`Enter the name`}
                  name="billing_firstname"
                  className="billing_firstname"
                  {...register('billing_firstname', {
                    required: t`firstname is required !!`,
                  })}
                />
                {errors.billing_firstname && (
                  <p className="error">{errors.billing_firstname.message}</p>
                )}
              </div>

              <div className={styles.customer_name}>
                <h4>
                  <Trans>Mobile</Trans>
                  <span className="form-required"> *</span>
                </h4>
                <Input
                  type="text"
                  placeholder={t`Mobile`}
                  name="phone_number"
                  className="phone_number"
                  {...register('phone_number', {
                    required: t`mobile is required !!`,
                  })}
                />
                {errors.phone_number && (
                  <p className="error">{errors.phone_number.message}</p>
                )}
              </div>

              <div className={styles.customer_email + '.mb-15'}>
                <h4>
                  <Trans>Email</Trans>
                  <span className="form-required"> *</span>
                </h4>
                <Input
                  type="text"
                  placeholder={t`Enter Email`}
                  name="email"
                  className="email "
                  {...register('email', {
                    required: t`email is required !!`,
                  })}
                />
                {errors.email && (
                  <p className="error">{errors.email.message}</p>
                )}
              </div>

              <div className="popup_action">
                <Button
                  title={t`Cancel`}
                  btnClass={'button-cancel'}
                  clickHandler={handleClose}
                />
                <Button
                  title={t`Add To Cart`}
                  btnClass={'button-proceed'}
                  type="submit"
                />
              </div>
            </div>
          </form>
        </Popup>
      )}
    </>
  );
};
