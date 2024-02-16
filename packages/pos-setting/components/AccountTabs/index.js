import React, { useState } from 'react';
import styles from './AccountTabs.module.scss';
import { Button, DropDown } from '@webkul/pos-ui';
import { Trans, t } from '@lingui/macro';

export const AccountTabs = () => {
  const [currentCurrency, setCurrentCurrency] = useState('$');
  const [currentStore] = useState('en');

  const CurrencyOptions = [
    { label: '$', value: '$' },
    { label: '#', value: '#' },
  ];

  const StoreOptions = [
    { label: 'en', value: 'en' },
    { label: 'de', value: 'de' },
  ];

  const handleCurrencyChange = (event) => {
    if (event.target.value === '0') {
      setCurrentCurrency('$');
    } else {
      setCurrentCurrency(event.target.value);
    }
  };

  const handleStoreChange = (event) => {
    if (event.target.value === '0') {
      setCurrentCurrency('en');
    } else {
      setCurrentCurrency(event.target.value);
    }
  };

  return (
    <>
      <div className={styles.postabcontainer}>
        <div className={styles.accountsetting}>
          <div className={styles.account_form}>
            <form className={styles.account}>
              <div className={styles.first_name}>
                <label className={styles.firstname}>
                  <Trans>Store Switch</Trans>
                </label>
                <span>
                  <DropDown
                    options={StoreOptions}
                    value={currentStore}
                    onChange={handleStoreChange}
                    className="selectbox"
                    type="store"
                  />
                </span>
              </div>

              <div className={styles.first_name}>
                <label className={styles.firstname}>
                  <Trans>Currency Switch</Trans>
                </label>
                <span>
                  <DropDown
                    options={CurrencyOptions}
                    value={currentCurrency}
                    onChange={handleCurrencyChange}
                    className="selectbox"
                    type="currency"
                  />
                </span>
              </div>

              <Button
                title={t`Update Account`}
                type="submit"
                btnClass={'button-proceed'}
              />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
