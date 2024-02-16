import React, { useState } from 'react';
import styles from '~/styles/Checkout/Checkout.module.scss';
import { Popup, Button } from '@webkul/pos-ui';
import { Trans, t } from '@lingui/macro';
import { useDispatch } from 'react-redux';
import { checkoutActions } from '~/store/checkout';
import { cartActions } from '~/store/cart';
import { InvoicePopup } from '../InvoicePopup';
import { orderItemActions } from '~/store/orderItem';

export const OrderSuccess = ({ props }) => {
  const [isOrderSuccess, setIsOrderSuccess] = useState(props);
  const [isPrintPopup, setIsPrintPopup] = useState(false);
  const dispatch = useDispatch();

  /**
   * manage skip popup and clear all the cart and checkout states
   * @param {data}
   */
  const handleSkip = () => {
    dispatch(cartActions.clearCart());
    dispatch(checkoutActions.clearPayment());
    dispatch(orderItemActions.clearOrderItem(null));
    createNewCart();
    setIsOrderSuccess(!isOrderSuccess);
  };

  /**
   * Manage print invoice
   */
  const handlePrint = () => {
    setIsOrderSuccess(!isOrderSuccess);
    setIsPrintPopup(!isPrintPopup);
  };

  /**
   * Create new cart after order get placed
   */
  const createNewCart = () => {
    const cart = {
      quoteId: Math.floor(Date.now() + Math.random()),
      cashierId: null,
      discount: null,
      grandDiscount: null,
      grandDiscountType: null,
      items: [],
      applied_coupons: null,
      tax: null,
    };

    dispatch(cartActions.setCart(cart));
  };

  return (
    <>
      {isOrderSuccess && (
        <Popup>
          <form className={styles.popup_form}>
            <div className={styles.holdcart_form}>
              <label>{<Trans>Order Success</Trans>}</label>
              <hr />
              <div className={styles.holdcart}>
                <h3 className="message">
                  {<Trans>The order has been successfully placed</Trans>}
                </h3>
              </div>
              <div className="popup_action">
                <Button
                  title={t`Skip`}
                  btnClass={'button-cancel'}
                  clickHandler={handleSkip}
                />
                <Button
                  title={t`Print Invoice `}
                  btnClass={'button-proceed'}
                  clickHandler={handlePrint}
                />
              </div>
            </div>
          </form>
        </Popup>
      )}
      {isPrintPopup && <InvoicePopup handleClose={handleSkip} />}
    </>
  );
};
