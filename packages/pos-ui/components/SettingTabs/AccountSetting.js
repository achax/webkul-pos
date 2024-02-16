import React from 'react';
import styles from './AccountSetting.module.scss';
import { Button, Input } from '@webkul/pos-ui';
import { Trans, t } from '@lingui/macro';

export const AccountSetting = () => {
  return (
    <>
      <div className={styles.postabcontainer}>
        <div className={styles.accountsetting}>
          <div className={styles.account_form}>
            <form className={styles.account}>
              <div className={styles.first_name}>
                <label className={styles.firstname}>
                  <Trans>Name</Trans>
                </label>
                <Input
                  type="text"
                  name="firstname"
                  className="first-name"
                  placeholder={t`Enter Name`}
                />
              </div>
              <div className={styles.prev_password}>
                <label className={styles.prev_password}>
                  <Trans>Previous Password</Trans>
                </label>
                <Input
                  type="password"
                  name="prev-password"
                  className="prev-password"
                  placeholder={t`Enter Previous Password`}
                />
              </div>
              <div className={styles.new_password}>
                <label className={styles.new_password}>
                  <Trans>New Password</Trans>
                </label>
                <Input
                  type="password"
                  name="new-password"
                  className="new-password"
                  placeholder={t`Enter New Password`}
                />
              </div>
              <div className={styles.confirm_password}>
                <label className={styles.confirm_password}>
                  <Trans>Confirm Password</Trans>
                </label>
                <Input
                  type="password"
                  name="confirm-password"
                  className="confirm-password"
                  placeholder={t`Enter Confirm Password`}
                />
              </div>
              <Button
                title={t`Update Account`}
                iconPath={'/assets/icons/plus-white.svg'}
                iconWidth={'20'}
                iconHeight={'20'}
                btnClass={styles.customer__edit_customer}
              />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
