import React from 'react';
import Image from 'next/image';
import styles from './Loader.module.scss';

export const Loader = () => {
  return (
    <React.Fragment>
      <div className={styles.loader}>
        <span className={styles.loader_wrapper}>
          <Image
            alt="loadericon"
            src="/assets/icons/square-loader-color.gif"
            width="100"
            height="50"
            priority={true}
          />
        </span>
      </div>
    </React.Fragment>
  );
};
