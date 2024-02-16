import React, { useState, useEffect } from 'react';
import styles from './SideBar.module.scss';
import { Popup, Button, ConfirmBox } from '@webkul/pos-ui';
import { Trans, t } from '@lingui/macro';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import CartItems from '../../../pos-cart/components/PosCart/CartItems';
import Discount from '../../../pos-cart/components/PosCart/Discount';
import BarCodeProduct from '../../../pos-cart/components/PosCart/BarCodeProduct';
import CustomProduct from '../../../pos-cart/components/PosCart/CustomProduct';
import Coupon from '../../../pos-cart/components/PosCart/Coupon';
import HoldCartNote from '../../../pos-cart/components/PosCart/HoldCartNote';
import { operationsActions } from '~/store/operations';
import { showToast, getFormattedPrice, getCartTax, isValidArray } from '~/utils/Helper';
import { cartActions } from '~/store/cart';
import { EditCustomer } from '~/packages/pos-customers';
import { ListPopup } from '@webkul/pos-customers';
import { db } from '~models';
export const SideBar = ({ setCheckout }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isBarCodePopup, setIsBarCodePopup] = useState(false);
  const [isNewProductPopup, setIsNewProductPopup] = useState(false);
  const [isHoldCartPopup, setIsHoldCartPopup] = useState(false);
  const [isDiscountPopup, setIsDiscountPopup] = useState(false);
  const [isCouponPopup, setIsCouponPopup] = useState(false);
  const [isSidebarOpen, setSidebar] = React.useState(false)
  const [isConfirm, setIsConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [editCustomerPopup, setEditCustomerPopup] = useState(false);
  const [isListPopup, setIsListPopup] = useState(false);
  const [customers, setCustomers] = useState();
  const cartProducts = useSelector((state) => state.cart?.quote);
  const cashDrawer = useSelector((state) => state.cashDrawer.cashdrawer);
  const selectedCustomer = useSelector(
    (state) => state.customer?.selectedCustomer
  );
  const [isProdRemove, setIsProdRemove] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState();
  const cartData = cartProducts.items;
  let tempTotalPayable;
  let discount;
  useEffect(() => {
    async function getCustomer() {
      const customer = await db.customer.toCollection().first();
      if (customer?.entity_id) {
        setCustomers(customer);
      }
    }
    if (!selectedCustomer?.entity_id) getCustomer();
  }, [selectedCustomer, dispatch]);
  useEffect(() => {
    // clear the cart functionality
    if (isSuccess && !isProdRemove) {
      dispatch(cartActions.clearCart());
      setIsConfirm(false);
      setIsSuccess(false);
    }
    //  remove product from the cart functionality
    if (isSuccess && isProdRemove) {
      dispatch(cartActions.removeProduct(selectedProduct.productId));
      setIsProdRemove(false);
      setIsConfirm(false);
      setIsSuccess(false);
      if (cartProducts.length === 1) {
        dispatch(cartActions.clearCart());
      }
    }
  }, [isSuccess]);
  const sideBarToggle = useSelector(
    (state) => state.operations?.operations?.sideBarStatus
  );
  const applied_coupons = useSelector(
    (state) => state.cart?.quote.applied_coupons
  );
  const toggleCouponPopup = () => {
    dispatch(operationsActions.setCouponStatus({ status: false }));
    setIsCouponPopup(!isCouponPopup);
  };
  /** SideBar Submit Handler */
  const handlePay = () => {
    cartProducts.items.length > 0
      ? router.push('./checkout')
      : showToast({ message: t`Cart Empty!!`, type: 'error' });

    setCheckout(false);
  };
  const handleAddCustomer = () => {
    router.replace('./customer');
  };
  const toggleBarcode = () => {
    setIsBarCodePopup(!isBarCodePopup);
  };
  const toggleNewProduct = () => {
    setIsNewProductPopup(!isNewProductPopup);
  };
  const toggleHoldCart = () => {
    if (cartData.length > 0) {
      isSidebarOpen && setSidebar(false)
      setIsHoldCartPopup(!isHoldCartPopup);
    } else {
      showToast({
        message: t`No Item into the cart`,
        type: 'error',
      });
    }
  };
  const toggleDiscountPopup = () => {
    setIsDiscountPopup(!isDiscountPopup);
  };

  const handleClearAll = React.useCallback(() => {
    if (cartData.length > 0) {
      setIsConfirm(!isConfirm);
      dispatch(operationsActions.setConfirmStatus({ status: false }));
    } else {
      showToast({
        message: t`No Item into the cart`,
        type: 'error',
      });
    }
  }, [operationsActions, dispatch, cartData])
  const discountType = cartProducts.grandDiscountType;
  const discountValue = cartProducts.discount ? cartProducts.discount : 0;
  const cartPrice =
    cartData.length > 0
      ? cartData.reduce(
        (acc, current) =>
          acc + (current.subtotal != 'undefined' ? current.subtotal : 0),
        0
      )
      : 0;
  var cartTax = 0;

  cartTax = isValidArray(cartData)
    ? cartData.reduce(
      (acc, current) =>
        acc +
        (current.subtotal != 'undefined'
          ? getCartTax(current, applied_coupons, current?.isProductTaxable)
          : 0),
      0
    )
    : 0;
  if (discountType === '%') {
    discount = (cartPrice * discountValue) / 100;
  } else {
    discount = discountValue;
  }
  let TotalPayable = cartPrice ? parseFloat(cartPrice + cartTax - discount) : 0;
  let couponDiscountAmount;
  const couponDiscount = applied_coupons
    ? applied_coupons.discount_amount
    : null;
  useEffect(() => {
    if (applied_coupons && applied_coupons.simple_action === 'by_percent') {
      couponDiscountAmount = (TotalPayable * couponDiscount) / 100;
      tempTotalPayable = TotalPayable - (TotalPayable * couponDiscount) / 100;
    } else {
      couponDiscountAmount = couponDiscount;
      tempTotalPayable = TotalPayable - couponDiscount;
    }
    if (tempTotalPayable > 0) {
      TotalPayable = tempTotalPayable;
    } else {
      dispatch(cartActions.clearCoupon(null));
    }
  }, [applied_coupons]);

  const handleRemoveProduct = React.useCallback((item) => {
    setIsConfirm(true);
    setIsProdRemove(true);
    setSelectedProduct(item);
  }, [dispatch, cartActions])

  React.useEffect(() => {
    if (sideBarToggle) {
      setSidebar(sideBarToggle)
    }
  }, [sideBarToggle])
  const sidebarHandler = React.useCallback(() => {
    setSidebar(!isSidebarOpen)
      , [isSidebarOpen]
  })

  const handleEditCustomer = () => {
    sidebarHandler()
    setEditCustomerPopup(true);
  };
  const toggleCustomerUpdate = React.useCallback(() => {
    sidebarHandler()
    setIsListPopup(!isListPopup);
  }, [isListPopup, sidebarHandler])

  return (
    <>
      {isListPopup && (
        <ListPopup
          isList={isListPopup}
          change={(isCheck) => setIsListPopup(!isCheck)}
        />
      )}
      {editCustomerPopup && (
        <EditCustomer
          CustomerPopup={editCustomerPopup}
          change={(isCheck) => setEditCustomerPopup(!isCheck)}
          customerList={customers}
        />
      )}

      {isSidebarOpen && (
        <Popup box="sidebar" close={sidebarHandler} >
          <div className={styles.sidebar_container}>
            <div className={styles.main_container}>
              <div className={styles.container}>
                {selectedCustomer.status ? (
                  <>
                    <div onClick={handleEditCustomer} className={styles.avatar}>
                      <div className=" p-5 avatar icon-customer-profile "></div>
                    </div>
                    <div onClick={toggleCustomerUpdate} className={styles.metainfo}>
                      <h5 className={styles.customer_name}>
                        {selectedCustomer.name}
                        {selectedCustomer.billing_lastname}
                      </h5>
                      <p>{selectedCustomer.email}</p>
                    </div>
                  </>
                ) : (
                  <div
                    className={styles.addcustomer}
                    onClick={handleAddCustomer}
                  >
                    <span className="icon icon-add"></span>
                    <div>
                      <h4
                        data-tip={`Add New Customer`}
                        data-place="bottom"
                        data-type="light"
                      >
                        <Trans> Add Customer</Trans>
                      </h4>
                    </div>
                  </div>
                )}
                <div className={styles.cartControl}>
                  <span
                    className="icon icon-add"
                    data-tip={t`Custom Product`}
                    data-place="bottom"
                    data-type="light"
                    onClick={toggleNewProduct}
                  ></span>
                  <span
                    className="icon icon-barcode"
                    data-tip={t`Barcode Product`}
                    data-place="bottom"
                    data-type="light"
                    onClick={toggleBarcode}
                  ></span>
                  <span
                    className="icon icon-reset"
                    data-tip={t`Clear All`}
                    data-place="bottom"
                    data-type="light"
                    onClick={handleClearAll}
                  ></span>
                </div>
              </div>
              <ul>
                {cartData && cartData[0] !== null
                  ? cartData.map((item, index) => (
                    <CartItems
                      item={item}
                      key={index}
                      removeProduct={(item) => handleRemoveProduct(item)}
                    />
                  ))
                  : console.log('no product into cart')}
              </ul>
            </div>

            <div className={styles.bottom_section}>
              <div className={styles.secondary_container_root}>
                <div className={styles.secondaryContainer}>
                  <div className={styles.discountWrapper}>
                    <div className={styles.label}>
                      <label className="mb-10">
                        <Trans>Add</Trans>
                      </label>
                    </div>
                    <div className={styles.discount_linkWrapper}>
                      <label
                        className="mb-10"
                        onClick={toggleDiscountPopup}
                        data-tip="Discount"
                        data-place="bottom"
                        data-type="light"
                      >
                        <Trans>Discount</Trans>
                      </label>
                      <label
                        className="mb-10"
                        onClick={toggleCouponPopup}
                        data-tip="Coupan"
                        data-place="bottom"
                        data-type="light"
                      >
                        <Trans>Coupon Code</Trans>
                      </label>
                    </div>
                  </div>
                </div>
                <table className={styles.tables}>
                  <tbody>
                    <tr>
                      <td className={styles.td}>
                        <Trans>Sub total</Trans>
                      </td>
                      <td className={styles.td}>
                        {getFormattedPrice(cartPrice)}
                      </td>
                    </tr>
                    <tr>
                      <td className={styles.td}>
                        <Trans>Tax</Trans>
                      </td>
                      <td className={styles.td}>
                        {getFormattedPrice(cartTax)}
                      </td>
                    </tr>
                    {discount > 0 && (
                      <tr className={styles.couponStatus}>
                        <td
                          className={`${styles.coupon}  ${styles.td}`}
                          onClick={toggleDiscountPopup}
                        >
                          <Trans>Discount</Trans>(
                          {cartProducts.discount +
                            cartProducts.grandDiscountType}
                          )
                        </td>
                        <td className={` ${styles.coupon}  ${styles.td}`}>
                          -{getFormattedPrice(discount)}
                        </td>

                        <td>
                          <span
                            className="icon icon-xcircle carticon crossIcon"
                            data-tip="remove item"
                            data-place="bottom"
                            data-type="light"
                            onClick={() =>
                              dispatch(
                                cartActions.applyDiscount({
                                  discount: null,
                                  type: null,
                                })
                              )
                            }
                          ></span>
                        </td>
                      </tr>
                    )}
                    {applied_coupons && applied_coupons.coupon_code && (
                      <tr className={styles.couponStatus}>
                        <td
                          className={` ${styles.coupon}  ${styles.td}`}
                          onClick={toggleCouponPopup}
                        >
                          <Trans>Coupon</Trans>({applied_coupons.coupon_code})
                        </td>
                        <td className={`${styles.coupon}  ${styles.td} `}>
                          -{getFormattedPrice(applied_coupons?.discount_amount)}
                        </td>
                        <span
                          className="icon icon-xcircle carticon crossIcon"
                          onClick={() =>
                            dispatch(cartActions.clearCoupon(null))
                          }
                        ></span>
                      </tr>
                    )}

                    <tr>
                      <td className={` ${styles.grand_total}  ${styles.td} `}>
                        <Trans>Payable Amount</Trans>
                      </td>
                      <td className={` ${styles.grand_total}  ${styles.td} `}>
                        {getFormattedPrice(TotalPayable)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={styles.cart_action_btn}>
                <Button
                  title={t`Hold Cart`}
                  hasIcon={true}
                  iconClass="icon-pause-circle"
                  iconBefore={true}
                  clickHandler={toggleHoldCart}
                  disabled={false}
                />
                <Button
                  title={t`Proceed`}
                  buttonType="success"
                  hasIcon={true}
                  iconClass="icon-arrow-right-circle"
                  iconBefore={true}
                  clickHandler={handlePay}
                  disabled={cashDrawer.status ? 'true' : 'false'}
                />
              </div>
            </div>
          </div>
        </Popup>
      )}
      {isDiscountPopup && (
        <Discount
          discountPopup={isDiscountPopup}
          cartPrice={cartPrice}
          change={(isCheck) => {
            setIsDiscountPopup(!isCheck);
          }}
          totalAmount={cartPrice}
        />
      )}
      {isBarCodePopup && (
        <BarCodeProduct
          barcodePopup={isBarCodePopup}
          change={(isCheck) => {
            setIsBarCodePopup(!isCheck);
          }}
        />
      )}
      {isCouponPopup && (
        <Coupon couponPopup={isCouponPopup} change={setIsCouponPopup} />
      )}

      {isNewProductPopup && (
        <CustomProduct
          newProductPopup={isNewProductPopup}
          change={(isCheck) => {
            setIsNewProductPopup(!isCheck);
          }}
        />
      )}
      {isHoldCartPopup && (
        <HoldCartNote
          holdCartPopup={isHoldCartPopup}
          cartData={cartData}
          grandTotal={TotalPayable}
          change={setIsHoldCartPopup}
          isSideBar={status}
        />
      )}
      {isDiscountPopup && (
        <Discount
          discountPopup={isDiscountPopup}
          cartPrice={cartPrice}
          change={(isCheck) => setIsDiscountPopup(!isCheck)}
          totalAmount={cartPrice}
          isSidebarOpen={true}
        />
      )}
      {isConfirm && (
        <ConfirmBox
          isConfirmPopup={isConfirm}
          title="Confirmation"
          message={
            isProdRemove
              ? t`Do you want to remove this product ?`
              : t`Do you want to clear all cart data ? `
          }
          change={(isCheck) => setIsConfirm(!isCheck)}
          onSuccess={setIsSuccess}
        />
      )}
    </>
  );
};
