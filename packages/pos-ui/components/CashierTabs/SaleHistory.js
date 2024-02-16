import React from 'react';
import styles from './TodayCash.module.scss';
import { Table } from '../Table';
// import { useTranslation } from 'next-i18next';
import { Trans, t } from '@lingui/macro';

export const SaleHistory = () => {
  // const { t } = useTranslation('common');

  const theadData = [
    t`Date`,
    t`Cash Sale`,
    t`Other Payments`,
    t`Total Sale`,
    t`Drawer Note`,
  ];

  const tbodyData = [
    {
      id: '1',
      items: [t`10/01/2022`, t`$1290`, t`$2902`, t`$4892`, t`Done`],
    },
  ];
  return (
    <>
      <div className={styles.__postabcontainer}>
        <div className={styles.order_list}>
          <h3>
            <Trans>Sales History</Trans>
          </h3>
          <div>
            <Table theadData={theadData} tbodyData={tbodyData} />
          </div>
        </div>
      </div>
    </>
  );
};
