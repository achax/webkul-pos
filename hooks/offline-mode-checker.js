import { useEffect, useState } from 'react';
import { db } from '~/models';
import { isValidObject, showToast } from '~utils/Helper';
import { POS_MODES } from '~utils/Constants';
import { setLocalStorage, getLocalStorage } from '~store/local-storage';
import { offlineModeAction } from '~store/offlineMode';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { usePosDetail } from './pos-app-handler';

export function useOfflineMode() {
  const [offlineModeEnable, setOfflineModeEnable] = useState(false);
  const [checkNetAvail, setCheckNetAvail] = useState(false);
  const dispatch = useDispatch();
  const offlineModeEnability = useSelector(
    (state) => state?.offline?.offlineModeEnable
  );

  const { appName } = usePosDetail();

  /**
   * offlineModeEnable Worked in the enum manner.
   * 0 : Offline disable
   * 1 : Offline Enable with Internet Connectivity
   * 2 : Offline Enable with Without Internet Connectivity
   */

  useEffect(() => {
    const getOfflineModeEnable = async () => {
      const netAvailable = window?.navigator?.onLine;

      const storeConfig = await db.storeConfig.toArray();
      if (isValidObject(storeConfig[0])) {
        const statusOfOffline =
          storeConfig[0]?.enableoffline === '1' ? true : false;

        if (!isValidObject(getLocalStorage(POS_MODES, true))) {
          setLocalStorage(POS_MODES, {
            enableOffline: statusOfOffline,
            isPosOnOffline: !netAvailable,
            internetConnected: netAvailable,
          });
        }
      }
    };

    const getStatusOfflineMode = () => {
      const posModeData = getLocalStorage(POS_MODES, true);
      const offlineModeEnable =
        isValidObject(posModeData) &&
        posModeData?.enableOffline === true &&
        !posModeData?.isPosOnOffline
          ? '1'
          : posModeData?.enableOffline === true && posModeData?.isPosOnOffline
          ? '2'
          : '0';
      setOfflineModeEnable(offlineModeEnable);
      dispatch(offlineModeAction.setOfflineEnability(offlineModeEnable));
    };

    getOfflineModeEnable();
    getStatusOfflineMode();
  }, [checkNetAvail, offlineModeEnability]);

  useEffect(() => {
    if (offlineModeEnable == 1 || offlineModeEnable == 0) {
      dispatch(offlineModeAction.setOfflineModeStatus(true));
    } else {
      dispatch(offlineModeAction.setOfflineModeStatus(false));
    }
  }, [offlineModeEnable, dispatch, checkNetAvail]);

  const isInternetAvailable = () => {
    let posModes = isValidObject(getLocalStorage(POS_MODES, true))
      ? getLocalStorage(POS_MODES, true)
      : {};

    let netAvailable = window?.navigator?.onLine;

    if (isValidObject(posModes)) {
      posModes['internetConnected'] = netAvailable;
      setLocalStorage(POS_MODES, posModes);
      setCheckNetAvail(!checkNetAvail);
    }
  };

  const isAllowCustomEdit = () => {
    setCheckNetAvail(!checkNetAvail);
  };

  const handleChangePosMode = () => {
    let posModes = isValidObject(getLocalStorage(POS_MODES, true))
      ? getLocalStorage(POS_MODES, true)
      : {};

    if (isValidObject(posModes)) {
      posModes['isPosOnOffline'] = !posModes['isPosOnOffline'];
      setLocalStorage(POS_MODES, posModes);
      showToast({
        type: 'success',
        message: `${
          posModes['isPosOnOffline']
            ? `${appName} is on Offline Mode, only synced Products and Customer is used !!`
            : `${appName} is on Online Mode !!`
        }`,
      });
      setCheckNetAvail(!checkNetAvail);
    }
  };

  return {
    handleChangePosMode,
    isInternetAvailable,
    offlineModeEnable,
    isAllowCustomEdit,
  };
}
