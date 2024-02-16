import React from 'react';
import { isValidArray } from '@utils/Helper';
import styles from './DemoCredentials.module.scss';

const DemoCredentials = ({ setCredentials }) => {
  const credentials = process.env.DEMO_CREDENTIALS.split(',');
  return (
    <>
      {isValidArray(credentials) && (
        <div className={styles.credentials_wrapper}>
          <h3 className={styles.credentials_title}>Demo Credentials</h3>
          <div className={styles.credentials_list}>
            {credentials.map((credential) => {
              credential = credential.split('||');
              return (
                <div
                  className={styles.credentials_item}
                  key={credential[0]}
                  onClick={() => setCredentials(credential)}
                >
                  {credential[0]}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default DemoCredentials;
