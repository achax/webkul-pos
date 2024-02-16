import React from 'react';
import styles from './PageLayout.module.scss';
import { Navbar } from '@webkul/pos-ui';
import Header from './Header';
// import { useOfflineMode } from '~/hooks';

export const PageLayout = ({ twoColumnLayout = false, children }) => {
  // const data = useOfflineMode();

  return (
    <React.Fragment>
      {twoColumnLayout ? (
        <div className={styles.layout}>
          <Header />
          <div className={styles.page_layout}>
            <Navbar />
            <section>{children}</section>
          </div>
        </div>
      ) : (
        <React.Fragment>{children}</React.Fragment>
      )}
    </React.Fragment>
  );
};
