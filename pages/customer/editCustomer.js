import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '~/styles/Customer/AddCustomer.module.scss';
import { Button, PosCart, Input } from '~/packages/pos-ui';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { customerActions } from '~/store/customer';
import { db } from '~/models';
import { showToast } from '~/utils/Helper';
import { Trans, t } from '@lingui/macro';
const EditCustomer = () => {
  const selectedCustomer = useSelector(
    (state) => state.customer.selectedCustomer
  );
  const router = useRouter();
  const dispatch = useDispatch();

  const { register, handleSubmit, setFocus, setValue } = useForm();

  useEffect(() => {
    setFocus('name');
  }, [setFocus]);

  useEffect(() => {
    if (!selectedCustomer || !selectedCustomer.name) {
      router.replace('/customer');
    }
  }, [router, selectedCustomer]);

  selectedCustomer.name
    ? setValue('name', selectedCustomer.name)
    : setValue('name', selectedCustomer.billing_firstname);

  selectedCustomer.phone_number
    ? setValue('phone_number', selectedCustomer.phone_number)
    : setValue('phone_number', selectedCustomer.phone_number);

  selectedCustomer.email
    ? setValue('email', selectedCustomer.email)
    : setValue('email', selectedCustomer.email);

  selectedCustomer.entity_id
    ? setValue('entity_id', selectedCustomer.entity_id)
    : setValue('entity_id', selectedCustomer.entity_id);

  const handleCustomer = (data) => {
    db.customer
      .update(data.entity_id, {
        name: data.name,
        email: data.email,
        phone_number: data.phone_number,
      })
      .then(function (updated) {
        if (updated) {
          showToast({
            message: t`Customer updated successfully !!`,
            type: 'success',
          });
        } else console.log('something went wrong !!');
      });
    dispatch(customerActions.updateCustomer(data));
  };

  const handleBack = () => {
    router.replace('/customer');
  };

  return (
    <div className={styles.addcustomer}>
      <section className={styles.info_section}>
        <div className={styles.head}>
          <h3 className={styles.title}>
            <Trans>Edit Customer </Trans>
          </h3>

          <p className={styles.back} onClick={handleBack}>
            <Trans>Back</Trans>
          </p>
        </div>

        <div className={styles.addcustomer_form}>
          <form
            className={styles.addcustomer_newcustomer}
            onSubmit={handleSubmit(handleCustomer)}
          >
            <div className={styles.two_col}>
              <div className={styles.customer_first_name}>
                <label className={styles.firstname}>
                  <Trans>First Name</Trans>
                </label>
                <Input
                  type="text"
                  name="name"
                  className="name"
                  {...register('name', { required: 'This is required' })}
                />
              </div>
            </div>
            <div className={styles.customer_phone}>
              <label className={styles.phone}>
                <Trans>Phone Number</Trans>
              </label>
              <Input
                type="number"
                name="phone_number"
                className="phone_number"
                {...register('phone_number', { required: t`This is required` })}
              />
            </div>
            <div className={styles.customer_email}>
              <label className={styles.email}>
                <Trans>Email</Trans>
              </label>
              <Input
                type="email"
                name="email"
                className="email"
                {...register('email', { required: t`This is required` })}
              />
            </div>
            <Button
              title={t`Submit`}
              hasIcon={true}
              iconClass="icon-edit"
              iconBefore={true}
              btnClass={styles.customer__edit_customer}
              type="submit"
            />
          </form>
        </div>
      </section>
      <PosCart />
    </div>
  );
};

export default EditCustomer;

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
