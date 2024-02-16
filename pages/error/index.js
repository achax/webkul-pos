import { useRouter } from 'next/router';
import React from 'react';
import Image from 'next/image';
import BrokenRobot from '../../public/assets/images/brokenRobot.svg';
import styles from '~/styles/Error/Error.module.scss';
import { Button } from '@webkul/pos-ui';
import { Trans } from '@lingui/macro';
const ErrorPage = () => {
  const router = useRouter();

  const handleReload = () => {
    router.back();
  };
  return (
    <div className={styles.error}>
      <h2>
        <Trans>POS-CART</Trans>
      </h2>

      <div className={styles.error__card}>
        <Image src={BrokenRobot} alt="broken_robot" />
      </div>

      <h3>
        <Trans>Network Error</Trans>
      </h3>

      <Button
        title={'Reload'}
        clickHandler={() => handleReload()}
        disabled={'false'}
      />
    </div>
  );
};

export default ErrorPage;
