import React from 'react';
import Image from 'next/image';
import styles from './NoDataScreen.module.scss';

export const NoDataAvailable = ({
  src,
  heading,
  descriptions,
  isDescReq,
  width,
  height,
}) => {
  return (
    <div className={styles.no_data_container}>
      <Image
        alt="not-data-img"
        src={src ? src : '/assets/images/no-product.svg'}
        width={width ? width : 400}
        height={height ? height : 400}
        priority={true}
      />
      <h1>{heading}</h1>
      {isDescReq ? <p>{descriptions}</p> : ''}
    </div>
  );
};
