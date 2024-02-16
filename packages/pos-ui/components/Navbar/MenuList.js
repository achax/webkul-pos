import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './Navbar.module.scss';
import { Trans, t } from '@lingui/macro';
import { ConfirmBox } from '@webkul/pos-ui';
import { usePosDetail } from '~hooks';
import { clearTableFromReSync, showToast } from '~/utils/Helper';
import { useSelector } from 'react-redux';
import useShortcuts from '~hooks/shortcuts';

const MenuList = ({ sideMenuData }) => {
  const router = useRouter();
  const [isConfirm, setIsConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { appName } = usePosDetail();
  const offlineModeEnability = useSelector(
    (state) => state?.offline?.offlineModeEnable
  );

  const handleRefresh = () => {
    offlineModeEnability == 2
      ? showToast({
          type: 'warning',
          message: t`${appName} in Offline Mode !!`,
        })
      : setIsConfirm(true);
  };
  const { redirectionAction } = useShortcuts(handleRefresh);
  React.useEffect(() => {
    if (window) {
      document.addEventListener('keyup', redirectionAction);
    }
    return () => {
      document.removeEventListener('keyup', redirectionAction);
    };
  }, [redirectionAction]);

  useEffect(() => {
    if (isSuccess) {
      reSyncFunc();
    }
  }, [isSuccess, reSyncFunc]);

  /**
   * Maintain the Resync functionality in pos-app.
   */
  const reSyncFunc = React.useCallback(async () => {
    const resync = clearTableFromReSync();
    for await (const _ of resync) {
      await resync.next();
      if ((await resync.next()).done) {
        router.push('/sync');
      }
    }
  }, [router]);

  return (
    <>
      <ul>
        {sideMenuData.map((item, index) => (
          <Link href={item.link} key={index}>
            <li
              className={
                router.route === item.link && item?.name !== 'Refresh'
                  ? styles.active
                  : styles.non_active
              }
              onClick={() => item?.name === 'Refresh' && handleRefresh()}
            >
              <div className={`icon p-0 ${item?.iconclass}`}></div>
              <Trans>{item.name}</Trans>
            </li>
          </Link>
        ))}
      </ul>

      {isConfirm && (
        <ConfirmBox
          isConfirmPopup={isConfirm}
          title="Confirmation"
          message={`Do you want to Refresh the ${appName} !!`}
          change={(isCheck) => setIsConfirm(!isCheck)}
          onSuccess={setIsSuccess}
        />
      )}
    </>
  );
};

export default MenuList;
