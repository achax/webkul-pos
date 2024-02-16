import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.scss';
import Image from 'next/image';
import { Input, ConfirmBox, SideBar, Popup } from '@webkul/pos-ui';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { configActions } from '~/store/config';
import screenfull from 'screenfull';
import { searchActions } from '~/store/search';
import { setLocalStorage, getLocalStorage } from '~/store/local-storage';
import BarCodeProduct from '../../../pos-cart/components/PosCart/BarCodeProduct';
import { db, deleteIndexDb } from '~/models';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import {
  showToast,
  isValidArray,
  clearTableFromReSync,
  isValidObject,
  deleteAccessTokenCookie,
  getTodayCashDrawer,
} from '~/utils/Helper';
import ReactTooltip from 'react-tooltip';
import { operationsActions } from '~/store/operations';
import Cashier_Logout from '../../../../API/mutation/CashierLogout.graphql';
import {
  useAccessToken,
  useOfflineMode,
  usePosDetail,
  usePosSync,
} from '~hooks';
import {
  OFFLINE_MODE_ENABLE_APP_OFFLINE,
  OFFLINE_MODE_ENABLE,
  OFFLINE_MODE_DISABLE,
} from '~/utils/Constants';
import dynamic from 'next/dynamic';
import { Trans, t } from '@lingui/macro';
const BarCodeMenual = dynamic(() =>
  import('../../../pos-cart/components/PosCart/BarCodeProduct')
);

const Header = () => {
  const textRef = useRef();
  const sideRef = useRef();
  const { accessToken } = useAccessToken();
  const [cashierLogout, { loading }] = useMutation(Cashier_Logout, {
    onCompleted: (data) => updateDBAndStore(data),
    onError: (error) => handleError(error),
    context: {
      headers: {
        'POS-TOKEN': accessToken,
      },
    },
  });
  const { register, watch } = useForm();
  const storeConfig = useSelector((state) => state.storeConfig?.config);
  const cashDrawer = useSelector((state) => state.cashDrawer.cashdrawer);
  const cartProducts = useSelector((state) => state.cart?.quote);
  const [activeTheme, setActiveTheme] = useState('light');
  const dispatch = useDispatch();
  const router = useRouter();
  const [isConfirm, setIsConfirm] = useState(false);
  const [isSideBar, setIsSideBar] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFullScreenActive, setIsFullScreenActive] = useState(false);
  const [
    isSyncAllow,
    // setIsSyncAllow
  ] = useState(false);
  const { syncingPosApp, loader, nonSyncCount, setSyncAllow } = usePosSync();
  const { handleChangePosMode, offlineModeEnable } = useOfflineMode();
  const { appName } = usePosDetail();
  const defaultImg = '/assets/images/logo.png';
  const [imgLoader, setImgLoader] = useState(true);
  const [imageSrc, setImageSrc] = useState(defaultImg);
  const [cashDrawerStatus, setCashDrawerStatus] = useState(false);
  const offlineModeEnability = useSelector(
    (state) => state?.offline?.offlineModeEnable
  );
  const [headerOfflineMode, setHeaderOfflineMode] = useState('');
  const [isBarCodePopup, setIsBarCodePopup] = useState(false);
  const [barCodeMenual, setBarCodeMenual] = useState(false);
  const [barCodeValue, setBarCodeValue] = useState('');
  const wifi =
    offlineModeEnable == OFFLINE_MODE_ENABLE
      ? 'icon-wifi-on'
      : offlineModeEnable == OFFLINE_MODE_ENABLE_APP_OFFLINE
        ? 'icon-wifi-off'
        : '';
  useEffect(() => {
    if (document !== 'undefined') {
      // document.addEventListener('click', clickOutside);
      document.addEventListener('keypress', barcodeHandler);
    }
    return () => {
      document.removeEventListener('keypress', barcodeHandler);
    };
  }, []);
  useEffect(() => {
    if (isSuccess && !isSyncAllow) {
      try {
        //--managing the cashier logout from the pos.
        const logoutCashier = async () => {
          const cashierData = await db.cashier.toArray();
          if (cashierData) {
            setIsConfirm(false);
            cashierLogout();
          }
        };
        logoutCashier();
      } catch (err) {
        console.error('Error in Login', err);
      }
    }
    if (isSuccess && isSyncAllow) {
      reSyncFunc();
    }
  }, [isSuccess, reSyncFunc, isSyncAllow, cashierLogout]);
  useEffect(() => {
    dispatch(operationsActions.setSideBarStatus({ status: isSideBar }));
  }, [isSideBar, dispatch]);
  useEffect(() => {
    const savedTheme = getLocalStorage('theme');
    savedTheme && setActiveTheme(savedTheme);
  }, []);
  useEffect(() => {
    if (offlineModeEnability || offlineModeEnable) {
      setHeaderOfflineMode(offlineModeEnability || offlineModeEnable);
    }
  }, [offlineModeEnability, offlineModeEnable]);
  useEffect(() => {
    document.body.dataset.theme = activeTheme;
    setLocalStorage('theme', activeTheme);
  }, [activeTheme]);
  /**
   * managing the status of CashDrawer
   */
  useEffect(() => {
    const getCashDrawerStatus = async () => {
      const cashDrawer = await db.cashDrawer.toArray();
      const todayCashDrawer = getTodayCashDrawer(cashDrawer);
      if (todayCashDrawer) {
        setCashDrawerStatus(
          todayCashDrawer?.status == OFFLINE_MODE_ENABLE ? true : false
        );
      }
    };
    getCashDrawerStatus();
  }, [dispatch, cashDrawer]);
  // detecting the width and height of the window screen
  useEffect(() => {
    window.addEventListener('resize', () => {
      if (window?.innerWidth > 1010) setIsSideBar(false);
      if (window?.innerWidth > 1010 && window?.innerWidth < 770)
        setIsSideBar(true);
      else if (window?.innerWidth <= 770) setIsSideBar(false);
      // remove event listener on clean up
      return () => window.removeEventListener('resize');
    });
  }, [isSideBar]);
  // managing the store-config in case of reload of app.
  useEffect(() => {
    const getStoreConfig = async () => {
      const records = await db.storeConfig.toArray();
      if (isValidArray(records)) {
        dispatch(configActions.setConfig(records?.[0]));
      }
    };
    getStoreConfig();
  }, [dispatch]);
  /** To handle outside click for sidebar */
  const clickOutside = (event) => {
    if (sideRef.current && sideRef.current.contains(event.target)) {
      const currentId =
        event.target?.id ||
        event.target.parentNode.parentNode.id ||
        event.target.parentNode.id;
      if (currentId == 'pos-cart-id') {
        setIsSideBar(false);
      }
    }
  };
  /** Barcode Handler */
  const barcodeHandler = (e) => {
    if (
      e.target.tagName !== 'INPUT' &&
      e.target.tagName !== 'TEXTAREA' &&
      e.key !== 'Enter'
    ) {
      if (e.key.match('^[A-Za-z0-9]+$')) {
        setIsBarCodePopup(true);
        setBarCodeValue(e.key);
      }
      e.preventDefault();
    }
  };
  const handleFullscreen = () => {
    if (screenfull.isEnabled) {
      screenfull.toggle();

      if (!screenfull.isFullscreen) {
        setIsFullScreenActive(true);
      } else {
        setIsFullScreenActive(false);
      }
    }
  };
  const handleLogout = () => {
    if (cashDrawer.status || cashDrawerStatus) {
      setIsConfirm(!isConfirm);
      dispatch(operationsActions.setConfirmStatus({ status: false }));
    } else {
      showToast({
        message: 'Please close the counter for logout',
        type: 'error',
      });
    }
  };

  //----------Debouncing----------//
  const watchAllFields = watch();
  useEffect(() => {
    const timeoutId = setTimeout(
      () => dispatch(searchActions.filterByName(watchAllFields.Search_product)),
      500
    );
    return () => clearTimeout(timeoutId);
  }, [watchAllFields.Search_product, dispatch]);

  const handleCart = () => {
    setIsSideBar(!isSideBar);
  };
  const updateDBAndStore = (data) => {
    if (data.cashierLogout && !data?.cashierLogout?.status) {
      dispatch(operationsActions.setConfirmStatus({ status: true }));
      showToast({
        type: 'error',
        message: `Unable to Logout`,
      });
    } else {
      dispatch(configActions.reset());
      deleteAccessTokenCookie();
      deleteIndexDb();
      localStorage.clear();
      sessionStorage.clear();
      dispatch(operationsActions.setConfirmStatus({ status: true }));
      router.push('/login');
    }
  };
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
  // handle the Error Case
  const handleError = () => {
    dispatch(operationsActions.setConfirmStatus({ status: true }));

    showToast({
      type: 'error',
      message: 'Unable to Logout',
    });
  };
  //handle the Wife Connectivity.
  const handleWifi = () => {
    handleChangePosMode();
    setSyncAllow((syncAllow) => !syncAllow);
  };
  useEffect(() => {
    if (
      isValidObject(storeConfig) &&
      storeConfig?.base_media_url &&
      storeConfig?.favicon
    ) {
      setImageSrc(
        `${storeConfig?.base_media_url}pos/favicon/${storeConfig?.favicon}`
      );
    }
  }, [storeConfig]);
  /**
   * Removed focus on load
   */
  if (textRef.current) {
    textRef.current.blur();
  }
  /** To hide barcode popup */
  const displayPopup = false;
  return (
    <div className={styles.header_container}>
      {loading && (
        <Popup box="category">
          <div className={styles.loader}>
            <h1>Logging Out !!</h1>
            <Image
              alt="loadericon"
              src="/assets/icons/square-loader-color.gif"
              width="100"
              height="50"
              priority={true}
            />
          </div>
        </Popup>
      )}
      <header className={styles.header}>
        <div className={styles.pos_logo}>
          {imgLoader && <div className={styles.img_loader}></div>}
          {isValidObject(storeConfig) &&
            storeConfig?.base_media_url &&
            storeConfig?.favicon && (
              <h3>
                <Image
                  alt="login_user"
                  onLoadStart={() => setImgLoader(true)}
                  onLoadingComplete={() => setImgLoader(false)}
                  src={imageSrc}
                  onError={() => setImageSrc(defaultImg)}
                  width="50"
                  height="50"
                  className="rounded_full"
                />
              </h3>
            )}
        </div>
        {router.pathname === '/' && (
          <div className={styles.search_product_wrapper}>
            <div className={styles.search_product}>
              <span className={styles.searchicon}>
                <span className="icon icon-search"></span>
              </span>
              <Input
                autofocus={true}
                type="search"
                name="Search-Product"
                placeholder={t`Search Products...`}
                className="searchinput"
                {...register('Search_product')}
              />
              <div>
                <span
                  onClick={() => setBarCodeMenual(!barCodeMenual)}
                  className={`icon barcode_ icon-barcode   font-20 ${styles.barcode_}`}
                  data-tip={t`Barcode Product`}
                  data-place="bottom"
                  data-type="light"
                ></span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.right_side_container}>
          <div className={styles.counterStatus}>
            {cashDrawerStatus && <span>Counter Closed !!</span>}
          </div>
          <div className={styles.icon_btn_container}>
            <div className={styles.icon_btn}>
              <div className={styles.icon}>
                <span
                  className={
                    isFullScreenActive
                      ? 'icon icon-hover-effect icon-minimize'
                      : 'icon icon-hover-effect icon-maximize'
                  }
                  onClick={handleFullscreen}
                  data-tip={isFullScreenActive ? t`Minimize` : t`Maximize`}
                  data-place="bottom"
                  data-type="light"
                ></span>
              </div>
            </div>
            {/**
             * For Syncing the Pos-App
             */}

            {headerOfflineMode == OFFLINE_MODE_DISABLE ? (
              ''
            ) : headerOfflineMode == OFFLINE_MODE_ENABLE_APP_OFFLINE ? (
              ''
            ) : (
              <div
                className={
                  headerOfflineMode == OFFLINE_MODE_ENABLE
                    ? styles.icon_btn_syncing
                    : styles.icon_btn
                }
              >
                <div className={styles.icon}>
                  {isValidObject(nonSyncCount) &&
                    (nonSyncCount?.holdOrder > 0 ||
                      nonSyncCount?.orderList > 0 ||
                      nonSyncCount?.cashDrawer > 0) ? (
                    <span className={styles.icon_notification}>*</span>
                  ) : (
                    ''
                  )}
                  <div>
                    <span
                      className=" icon icon-hover-effect icon-sync"
                      data-tip={t`Syncing the ${appName}`}
                      data-place="bottom"
                      data-type="light"
                      onClick={syncingPosApp}
                    ></span>
                  </div>
                </div>
              </div>
            )}

            {headerOfflineMode == OFFLINE_MODE_DISABLE ? (
              ''
            ) : (
              <div className={styles.icon_btn}>
                <div className={styles.icon}>
                  <span
                    className={`icon icon-hover-effect ${wifi} `}
                    onClick={handleWifi}
                    data-tip={
                      headerOfflineMode == OFFLINE_MODE_ENABLE
                        ? t`Online`
                        : t`Offline`
                    }
                    data-place="bottom"
                    data-type="light"
                  ></span>
                </div>
              </div>
            )}

            <div className={styles.logout_btn}>
              <div className={styles.logout_icon}>
                <span
                  className="icon  icon-power logout"
                  data-tip={t`Logout`}
                  data-place="bottom"
                  data-type="light"
                  onClick={() => handleLogout()}
                ></span>
              </div>
            </div>
            {
              router.pathname !== '/checkout' && (
                <div className={styles.cart_btn}>
                  <div className={styles.cart_icon}>
                    <label className={`${styles.cart_count} cart-count`}>
                      {cartProducts.items.length}
                    </label>
                    <span
                      className="icon icon-hover-effect  icon-cart"
                      onClick={() => handleCart()}
                    ></span>
                  </div>
                </div>

              )
            }

          </div>
        </div>
      </header>

      {loader && (
        <Popup box="category">
          <div className={styles.loader}>
            <h1>{`Kindly Wait We're syncing the ${appName}!!`}</h1>
            {isValidObject(nonSyncCount) && (
              <>
                <h2>
                  <Trans>Hold-Orders</Trans> - {nonSyncCount?.holdOrder}
                </h2>
                <h2>
                  <Trans>Order-Lists </Trans>- {nonSyncCount?.orderList}
                </h2>
                <h2>
                  <Trans>Cash-Drawer </Trans> - {nonSyncCount?.cashDrawer}
                </h2>
              </>
            )}
            <h2></h2>
            <Image
              alt="loadericon"
              src="/assets/icons/square-loader-color.gif"
              width="100"
              height="50"
              priority={true}
            />
          </div>
        </Popup>
      )}

      {isConfirm && (
        <ConfirmBox
          isConfirmPopup={isConfirm}
          title="Confirmation"
          message={
            isSyncAllow ? (
              <Trans>Do you want to Resync the Pos-App ?</Trans>
            ) : (
              <Trans>Do you want to Logout ? </Trans>
            )
          }
          change={(isCheck) => setIsConfirm(!isCheck)}
          onSuccess={setIsSuccess}
        />
      )}
      <div className="">
        <BarCodeMenual
          barcodePopup={barCodeMenual}
          change={() => {
            setBarCodeMenual(false);
          }}
          barCodeValue={barCodeValue}
        />
      </div>
      <div ref={sideRef} id="pos-cart-id">
        {isSideBar && <SideBar setCheckout={setIsSideBar} />}
      </div>
      {isBarCodePopup && (
        <div className={!displayPopup ? styles.header_barcode : ''}>
          <BarCodeProduct
            barcodePopup={isBarCodePopup}
            change={() => {
              setIsBarCodePopup(false);
            }}
            barCodeValue={barCodeValue}
            displayPopup={displayPopup}
          />
        </div>
      )}
      <ReactTooltip className={styles.header_tool_tip} />
    </div>
  );
};

export default Header;
