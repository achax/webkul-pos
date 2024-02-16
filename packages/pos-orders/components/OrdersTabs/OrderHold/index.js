import React, { useEffect, useState, useRef } from 'react';
import styles from './OrderHold.module.scss';
import OrderHoldItem from './OrderHoldItem';
import { db } from '~/models';
import { useSelector, useDispatch } from 'react-redux';
import { holdCartActions } from '~/store/holdCart';
import { InitialAmountPopup, ConfirmBox } from '@webkul/pos-ui';
import { showToast, isValidArray } from '~/utils/Helper';
import { useMutation } from '@apollo/client';
import REMOVE_HOLD_ORDER from '~/API/mutation/RemoveHoldOrder.graphql';
import { cartActions } from '~/store/cart';
import { useRouter } from 'next/router';
import { Input, NoDataAvailable } from '@webkul/pos-ui';
import { TabList } from '@webkul/pos-orders';
import { usePosSync, useOfflineMode, useAccessToken } from '~/hooks';
import { CUSTOM_PRODUCT_SKU } from '~/utils/Constants';

const TABS = [
  {
    id: 1,
    title: 'Online Hold Orders',
  },
  {
    id: 2,
    title: 'Offline Hold Orders',
  },
];

export const OrderHold = () => {
  const dispatch = useDispatch();
  const [isInitialAmt, setIsInitialAmt] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedItem, setSelectedItem] = useState();
  const [isOrderResume, setIsOrderResume] = useState(false);
  const router = useRouter();
  const { accessToken } = useAccessToken();

  const [deleteHoldOrder, { error }] = useMutation(REMOVE_HOLD_ORDER, {
    onError: (error) => handleError(error),
    onCompleted: () =>
      showToast({
        type: 'success',
        message: 'Hold Order is Successfully Removed !!',
      }),
    context: {
      headers: {
        'POS-TOKEN': accessToken,
      },
    },
  });
  const { offlineModeEnable } = useOfflineMode();
  const [holdCartOrders, setHoldCartOrders] = useState();
  const [activeId, setActiveId] = useState(1);
  const { handleFunCallOnPosMode } = usePosSync();

  const searchRef = useRef();

  let cashDrawer;

  // get hold cart data from redux state

  let holdCartData = useSelector((state) => state?.holdcart?.holdCartData);
  let data = [];

  // loading the Hold Orders Data

  useEffect(() => {
    async function getHoldData() {
      data = await db.holdCart.toArray();
      if (data.length > 0) {
        dispatch(holdCartActions.refreshHoldCart(data));
      }
    }
    getHoldData();
  }, []);

  // loading the Cash Drawer Details

  useEffect(() => {
    async function loadCashDrawer() {
      try {
        cashDrawer = await db.cashDrawer.toArray();
        if (!cashDrawer.length) setIsInitialAmt(true);
      } catch (err) {
        showToast({ type: 'error', message: err.message });
      }
    }
    loadCashDrawer();
  });

  // loading hold Order in the cart

  useEffect(() => {
    if (holdCartData && holdCartData.length >= 0)
      setHoldCartOrders(() => mergeHoldCart(holdCartData));
  }, [holdCartData, activeId]);

  //  Resume and Remove on Hold Orders functionality

  useEffect(() => {
    if (isSuccess && !isOrderResume) {
      removeOrderFromHoldCart(selectedItem);
      setIsConfirm(false);
      setIsSuccess(false);
    }

    if (isSuccess && isOrderResume) {
      resumeOrderFromHoldCart(selectedItem);
      setIsConfirm(false);
      setIsSuccess(false);
      setIsOrderResume(false);
    }
  }, [isSuccess]);

  // handling error case.

  const handleError = () => {
    showToast({ type: 'error', message: 'Unable to Processed Order' });
  };

  /**
   * remove hold Order from Hold cart
   * @param {Object} item
   */

  const removeOrderFromHoldCart = () => {
    handleFunCallOnPosMode(removeOrderInOnline, removeOrderInOffline);
  };

  const removeOrderInOffline = () => {
    if (selectedItem?.id != '') {
      dispatch(holdCartActions.removeHoldItem(selectedItem?.id));
    }
  };

  const removeOrderInOnline = () => {
    if (selectedItem?.id != '') {
      try {
        deleteHoldOrder({
          variables: { input: selectedItem?.id },
        });
        if (error) console.error(error);
      } catch (error) {
        showToast({ message: 'Invalid Credentials', type: 'error' });
      }

      dispatch(holdCartActions.removeHoldItem(selectedItem?.id));
    }
  };

  /**
   * Resume with Hold Order from Hold Cart
   * @param {Object} item
   */

  const resumeOrderFromHoldCart = async (item) => {
    const createProductData = (productItem) => {
      const productData = {
        ...productItem,
        typeId: productItem.product_type,
        custom_product: productItem.product_type === CUSTOM_PRODUCT_SKU,
        note: productItem?.pos_custom_option?.description,
      };
      delete productData.product_type;
      return productData;
    };

    const cart = await db.cart.toArray();
    // check for pos-cart doesn't have any order
    if (cart.length > 0) {
      showToast({
        type: 'warning',
        message: 'Please clear the cart to resume Hold Order',
      });
    } else {
      item?.items.map((data) => {
        dispatch(cartActions.addItemToCart(createProductData(data)));
      });

      removeOrderFromHoldCart(item);
      router.replace('/');
    }
  };

  const handleRemoveOrder = (data) => {
    setSelectedItem(data);
    setIsOrderResume(false);
    setIsConfirm(true);
  };

  const handleResumeOrder = (data) => {
    setSelectedItem(data);
    setIsConfirm(true);
    setIsOrderResume(true);
  };

  const handleSearch = () => {
    const search = searchRef?.current?.value.toLowerCase();
    const data =
      holdCartData.length > 0 &&
      holdCartData.filter((order) => order.note.toLowerCase().includes(search));
    setHoldCartOrders(() => mergeHoldCart(data));
  };

  /**
   *
   * @param {Array} data
   * @returns {Array} uniqueHoldCart
   *  managing the merging the holdCart Items and remove duplicate data
   */

  const mergeHoldCart = (data) => {
    const uniqueHoldCart =
      isValidArray(data) && [...new Map(data.map((v) => [v.id, v])).values()] &&
      data?.filter(
        (item) =>
          (activeId === 1
            ? item?.synchronized === 1
            : item?.synchronized === 0) &&
          (item?.isDeleted === 1 ? false : true)
      );

    return uniqueHoldCart;
  };

  const handleTabChange = (item) => {
    setActiveId(item?.id);
  };

  return (
    <>
      <div className={styles.postabcontainer}>
        {offlineModeEnable === '0' ? (
          ''
        ) : (
          <div className={styles.tab_options}>
            {isValidArray(TABS) && (
              <TabList
                TABS={TABS}
                onChange={(item) => {
                  handleTabChange(item);
                }}
                activeId={activeId}
              />
            )}
          </div>
        )}

        <div className={styles.hold_order_search}>
          <span>
            <span className="icon icon-search"></span>
          </span>
          <Input
            type="text"
            name="search-hold-order"
            placeholder="Enter the Note..."
            ref={searchRef}
            onChange={handleSearch}
          />
        </div>
        <div
          className={
            offlineModeEnable === '0'
              ? styles.hold_section_mode
              : styles.hold_section
          }
        >
          {isValidArray(holdCartOrders)
            ? holdCartOrders.map((item, index) => (
                <OrderHoldItem
                  key={index}
                  item={item}
                  removeOrder={(data) => handleRemoveOrder(data)}
                  resumeOrder={(data) => handleResumeOrder(data)}
                />
              ))
            : ''}
        </div>

        {!isValidArray(holdCartOrders) && (
          <section>
            <NoDataAvailable
              width={200}
              height={200}
              isDescReq={true}
              heading={'No Hold Order Item is available'}
              descriptions={'Pls Add the Order in the Hold Order Cart'}
            />
          </section>
        )}
      </div>
      {isInitialAmt && (
        <InitialAmountPopup
          initialPopup={isInitialAmt}
          change={setIsInitialAmt}
        />
      )}

      {isConfirm && (
        <ConfirmBox
          isConfirmPopup={isConfirm}
          title="Confirmation"
          message={
            isOrderResume
              ? 'Do you want to resume this Order ?'
              : 'Do you want to remove this Order ?'
          }
          change={(isCheck) => {
            setIsConfirm(!isCheck);
          }}
          onSuccess={setIsSuccess}
        />
      )}
    </>
  );
};
