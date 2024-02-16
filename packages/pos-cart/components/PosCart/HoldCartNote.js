import React, { useState, useEffect } from 'react';
import { Button, Popup, Textarea } from '@webkul/pos-ui';
import styles from './PosCart.module.scss';
import { Trans, t } from '@lingui/macro';
import { useDispatch, useSelector } from 'react-redux';
import { cartActions } from '~/store/cart';
import { holdCartActions } from '~/store/holdCart';
import SAVE_HOLD_ORDERS from '~/API/mutation/SaveHoldOrders.graphql';
import { useMutation } from '@apollo/client';
import { showToast, isValidArray } from '~/utils/Helper';
import { useAccessToken, useOfflineMode, usePosSync } from '~/hooks';
import { CUSTOM_PRODUCT_SKU } from '~/utils/Constants';

/**
 * HoldCartNote popup component
 * @param {object} props
 * @returns html
 */
const HoldCartNote = ({
  holdCartPopup,
  cartData,
  grandTotal,
  change,
  setIsSideBar = null,
  isSideBar = null,
}) => {
  const [isHoldCartPopup, setIsHoldCartPopup] = useState(holdCartPopup);
  const [note, setNote] = useState('');
  const dispatch = useDispatch();
  const [products, setProducts] = useState();
  const cashierData = useSelector((state) => state?.cashier);
  const { handleFunCallOnPosMode } = usePosSync();
  const { offlineModeEnable } = useOfflineMode();
  const { accessToken } = useAccessToken();

  const [saveHoldOrders, { data, loading, error }] = useMutation(
    SAVE_HOLD_ORDERS,
    {
      onError: (error) => handleError(error),
      onCompleted: (data) => updateCart(data),
      context: {
        headers: {
          'POS-TOKEN': accessToken,
        },
      },
    }
  );
  useEffect(() => {
    if (data?.saveHoldOrders) {
      setIsHoldCartPopup(false);
      change(isHoldCartPopup);
    }
  }, [data, setIsHoldCartPopup, change, isHoldCartPopup]);

  useEffect(() => {
    let productData =
      isValidArray(cartData) &&
      cartData.filter((item) => !item?.custom_product);
    let customProduct =
      isValidArray(cartData) && cartData.filter((item) => item?.custom_product);

    let formattedProductData =
      isValidArray(productData) &&
      productData?.map((item) => ({
        sku: item.sku,
        qty: item.qty,
        name: item.name,
        price: item.price,
        discount: item?.discount,
        discount_type: item?.discount_type,
        displayOption: item?.displayOption,
        product_type: item.typeId,
        product_option: item?.product_option,
        selectedChildSku: item?.selectedChildSku || item?.selectedProductSku,
        taxAmount: item?.taxAmount,
        baseSubTotal: item?.baseSubTotal,
      }));

    let customProductData =
      isValidArray(customProduct) &&
      customProduct.map((item) => ({
        sku: item.sku,
        qty: item.qty,
        name: item.name,
        price: item.price,
        discount: item?.discount,
        discount_type: item?.discount_type,
        displayOption: item?.displayOption,
        product_type: CUSTOM_PRODUCT_SKU,
        product_option: item?.product_option,
        pos_custom_option: {
          name: item?.name,
          price: item?.price,
          quantity: item?.qty,
          description: item?.note,
        },
        selectedChildSku: CUSTOM_PRODUCT_SKU,
        taxAmount: item?.taxAmount,
        baseSubTotal: item?.baseSubTotal,
      }));

    let products =
      isValidArray(formattedProductData) && isValidArray(customProductData)
        ? formattedProductData.concat(customProductData)
        : !isValidArray(formattedProductData) && isValidArray(customProductData)
        ? customProductData
        : isValidArray(formattedProductData) && !isValidArray(customProductData)
        ? formattedProductData
        : [{}];

    setProducts(products);
  }, [cartData]);

  /**
   * set holdCart Data
   * @param {Array} data
   * @returns object
   */
  const holdCartItem = (note, synchronized = 1) => {
    var today = new Date();
    var date =
      today.getFullYear() +
      '-' +
      (today.getMonth() + 1) +
      '-' +
      today.getDate();
    var time =
      today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    var CurrentDateTime = date + ' ' + time;
    const holdData = {
      date: CurrentDateTime,
      items: products,
      note: note,
      currency_code: 'null',
      grand_total: grandTotal,
      base_grand_total: grandTotal,
      cashier_id: cashierData?.cashier?.id,
      outlet_id: cashierData?.cashier?.outlet_id,
      synchronized: synchronized,
    };
    return holdData;
  };

  /**
   * set holdCart Data
   * @param {note} String
   * @param {id} Int
   * @returns object
   */

  const holdCartItemAfterSuccess = (note, id) => {
    var today = new Date();
    var date =
      today.getFullYear() +
      '-' +
      (today.getMonth() + 1) +
      '-' +
      today.getDate();
    var time =
      today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    var currentDateTime = date + ' ' + time;
    const holdData = {
      date: currentDateTime,
      items: products,
      note: note,
      id: id,
      currency_code: 'null',
      grand_total: grandTotal,
      base_grand_total: grandTotal,
      cashier_id: cashierData?.cashier?.id,
      outlet_id: cashierData?.cashier?.outlet_id,
      synchronized:
        offlineModeEnable === '2' ? 0 : offlineModeEnable === '1' ? 1 : 1,
    };
    return holdData;
  };

  /**
   * CustomProduct Close button
   */
  const handleClose = () => {
    setIsHoldCartPopup(!holdCartPopup);
    change(isHoldCartPopup);
  };

  async function getHoldData(holdData) {
    if (holdData) {
      holdData.synchronized = 1;

      try {
        saveHoldOrders({
          variables: {
            input: holdData,
          },
        });

        if (error) console.log(error);
      } catch (error) {
        console.log(error.message);
      }
    }
  }

  const handleOnlineHoldCart = () => {
    if (note != '') {
      try {
        getHoldData(holdCartItem(note));
        handleClose();
      } catch (err) {
        console.log(err);
      }
    } else {
      showToast({ message: t`This field is required !!`, type: 'error' });
    }
  };

  const handleOfflineHoldCart = () => {
    if (note != '') {
      try {
        const holdCartData = holdCartItem(note, 0);
        updateCart(holdCartData, false);
        handleClose();
      } catch (err) {
        console.log(err);
      }
    } else {
      showToast({ message: t`This field is required !!`, type: 'error' });
    }
  };

  const handleChange = (e) => {
    setNote(e.target.value);
  };

  /**
   * managing the error case
   * @param {error}
   */

  const handleError = (error) => {
    if (error) {
      showToast({ type: 'error', message: t`Unable to Hold Order` });
    }
  };

  /**
   * updating the cart after order get successfully hold
   * @param {data}
   */

  const updateCart = (data, online = true) => {
    if (data) {
      dispatch(
        holdCartActions.setHoldCart(
          holdCartItemAfterSuccess(
            note,
            online === true ? data.saveHoldOrders.id : data?.id
          )
        )
      );
      dispatch(cartActions.clearCart());
      isSideBar && setIsSideBar(!isSideBar);
    }
  };

  return (
    <>
      {isHoldCartPopup && (
        <Popup close={handleClose}>
          <form className={styles.popup_form}>
            <div className={styles.holdcart_form}>
              <label>{<Trans>Hold Cart</Trans>}</label>

              <div className={styles.holdcart}>
                <h4>{<Trans>Cart Note </Trans>}</h4>
                {
                  <Textarea
                    name="message"
                    rows="3"
                    cols="50"
                    placeholder={t`Enter the note for holding cart `}
                    className="form-control ordernote"
                    onChange={(e) => handleChange(e)}
                  />
                }
              </div>
              <div className="popup_action">
                <Button
                  title={t`Cancel`}
                  btnClass={'button-cancel'}
                  clickHandler={handleClose}
                />
                <Button
                  title={t`Proceed `}
                  btnClass={'button-proceed'}
                  loading={loading}
                  clickHandler={() =>
                    handleFunCallOnPosMode(
                      handleOnlineHoldCart,
                      handleOfflineHoldCart
                    )
                  }
                />
              </div>
            </div>
          </form>
        </Popup>
      )}
    </>
  );
};

export default HoldCartNote;
