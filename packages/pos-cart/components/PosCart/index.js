import React, { useState, useEffect } from 'react';
import styles from './PosCart.module.scss';
import { Button, ConfirmBox } from '@webkul/pos-ui';
import CartItems from './CartItems';
import { AddCustomer } from '../../../pos-customers/components/AddCustomer';
import CustomProduct from './CustomProduct';
import Coupon from './Coupon';
import HoldCartNote from './HoldCartNote';
import Discount from './Discount';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { cartActions } from '~/store/cart';
import { operationsActions } from '~/store/operations';
import { Trans, t } from '@lingui/macro';
import { getCurrencySymbol } from '~/utils/Helper';
import { EditCustomer } from '~/packages/pos-customers';

import {
  showToast,
  getFormattedPrice,
  isValidArray,
  isValidObject,
  getTodayCashDrawer,
  getProductSubTotal,
  getProductItemAmount,
  getCartCouponAmt,
  getCustomCartDiscount,
  getCartTax,
} from '~/utils/Helper';
import ReactTooltip from 'react-tooltip';
import { ListPopup } from '@webkul/pos-customers';
import { customerActions } from '~/store/customer';
import { db } from '~/models';
import { usePosTax } from '~/hooks';

export const PosCart = () => {
  const dispatch = useDispatch();
  const currency = getCurrencySymbol();
  const router = useRouter();
  const [isCustomerPopup, setIsCustomerPopup] = useState(false);
  const [isNewProductPopup, setIsNewProductPopup] = useState(false);
  const [isHoldCartPopup, setIsHoldCartPopup] = useState(false);
  const [isDiscountPopup, setIsDiscountPopup] = useState(false);
  const [isCouponPopup, setIsCouponPopup] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const cartProducts = useSelector((state) => state.cart?.quote);
  const cashDrawer = useSelector((state) => state.cashDrawer.cashdrawer);
  const selectedCustomer = useSelector(
    (state) => state.customer?.selectedCustomer
  );
  const [selectedProduct, setSelectedProduct] = useState();
  const [isProdRemove, setIsProdRemove] = useState(false);
  const [isListPopup, setIsListPopup] = useState(false);
  const [editCustomerPopup, setEditCustomerPopup] = useState(false);
  const [customers, setCustomers] = useState();
  useEffect(() => {
    async function getCustomer() {
      const customer = await db.customer.toCollection().first();
      if (customer?.entity_id) {
        dispatch(customerActions.setCustomer(customer));
        setCustomers(customer);
      }
    }

    if (!selectedCustomer?.entity_id) getCustomer();
  }, [selectedCustomer, dispatch]);
  useEffect(() => {
    async function getCustomer() {
      const defaultCustomerId = await db.cashier.toCollection().first();
      const customer = defaultCustomerId?.customer_id
        ? await db.customer
          .where('entity_id')
          .equals(defaultCustomerId?.customer_id)
          .first()
        : await db.customer.toCollection().first();
      if (customer?.entity_id) {
        dispatch(customerActions.setCustomer(customer));
      }
    }

    if (!selectedCustomer?.entity_id) getCustomer();
  }, [selectedCustomer, dispatch]);

  const cartData = React.useMemo(() => cartProducts?.items, [cartProducts])

  const {
    taxRate,
    ruleProductTaxClass,
    productCalculationMethod,
    storeProductTaxClass,
    taxTitle,
  } = usePosTax();
  const [cashDrawerStatus, setCashDrawerStatus] = useState(false);

  const applied_coupons = useSelector(
    (state) => state.cart?.quote.applied_coupons
  );

  let subTotal = 0;
  let totalPayableAmount = 0;
  let customCartDiscount = 0;
  let couponCodeVal = 0;
  let cartTax = 0;

  const taxableCartItems =
    isValidArray(cartData) &&
    cartData?.filter((item) => item?.isProductTaxable);

  const nonTaxableCartItems =
    isValidArray(cartData) &&
    cartData.filter((item) => !item?.isProductTaxable);

  const cartPriceWithTaxItems = isValidArray(taxableCartItems)
    ? taxableCartItems.reduce(
      (acc, current) =>
        acc +
        (current.subtotal != 'undefined'
          ? getProductSubTotal(
            productCalculationMethod,
            ruleProductTaxClass,
            storeProductTaxClass,
            current?.taxClassId,
            current?.subtotal,
            taxRate
          )
          : 0),
      0
    )
    : 0;

  const cartPriceWithoutTaxItems = isValidArray(nonTaxableCartItems)
    ? nonTaxableCartItems.reduce(
      (acc, current) =>
        acc +
        (current.subtotal != 'undefined' ? parseFloat(current.subtotal) : 0),
      0
    )
    : 0;

  // subTotal is sum of taxableProduct and nonTaxableProducts.

  subTotal =
    parseFloat(cartPriceWithTaxItems) + parseFloat(cartPriceWithoutTaxItems);

  // get the CouponCode  Amount on product Items.

  couponCodeVal = isValidArray(cartData)
    ? cartData.reduce(
      (acc, current) =>
        acc +
        (current.subtotal != 'undefined'
          ? getCartCouponAmt(applied_coupons, current)
          : 0),
      0
    )
    : 0;

  const cartPriceAfterDiscount = isValidArray(cartData)
    ? cartData.reduce(
      (acc, current) =>
        acc +
        (current.subtotal != 'undefined'
          ? getProductItemAmount(
            applied_coupons,
            current,
            current.isProductTaxable
          )
          : 0),
      0
    )
    : 0;

  // Custom Cart Discount is value discount applied after tax and coupon-code.
  customCartDiscount =
    isValidObject(cartProducts) && cartProducts?.discount
      ? getCustomCartDiscount(
        cartProducts?.grandDiscountType,
        cartProducts?.discount,
        subTotal
      )
      : 0;

  // cartTax Amt value
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

  // Payable Amount after applied coupon code and tax.

  totalPayableAmount = cartPriceAfterDiscount - customCartDiscount;
  useEffect(() => {
    // clear the cart functionality
    if (isSuccess && !isProdRemove) {
      dispatch(cartActions.clearCart());
      setIsConfirm(false);
      setIsSuccess(false);
      showToast({
        type: 'success',
        message: 'Cart clear successfully !!',
      });
    }
    //  remove product from the cart functionality

    if (isSuccess && isProdRemove) {
      dispatch(cartActions.removeProduct(selectedProduct.productId));
      setIsProdRemove(false);
      setIsConfirm(false);
      setIsSuccess(false);

      if (cartProducts.items.length === 1) {
        dispatch(cartActions.clearCart());
      }
    }
  }, [isSuccess]);

  const handleAddCustomerPopup = React.useCallback(() => {
    setIsCustomerPopup(!isCustomerPopup);
  }, [isCustomerPopup]);
  /**
   * load cart item from indexedDB in case of reload
   */
  /**
   * managing the status of CashDrawer
   */

  useEffect(() => {
    const getCashDrawerStatus = async () => {
      const cashDrawer = await db.cashDrawer.toArray();
      const todayCashDrawer = getTodayCashDrawer(cashDrawer);
      if (todayCashDrawer) {
        setCashDrawerStatus(todayCashDrawer?.status == 1 ? true : false);
      }
    };

    getCashDrawerStatus();
  }, [dispatch, cashDrawer]);

  const toggleCouponPopup = () => {
    // Detect If Customer is available or not.
    if (isValidObject(selectedCustomer) && selectedCustomer?.name !== null) {
      dispatch(operationsActions.setCouponStatus({ status: false }));
      setIsCouponPopup(!isCouponPopup);
    } else {
      showToast({
        type: 'warning',
        message: t`Please Add the Customer !!`,
      });
    }
  };

  const toggleCustomerUpdate = () => {
    setIsListPopup(!isListPopup);
    dispatch(customerActions.setCustomerSelectStatus(false));
  };



  const handlePay = () => {
    cartProducts && cartProducts.items.length > 0
      ? router.push('./checkout')
      : showToast({ message: t`Cart Empty!!`, type: 'warning' });
  };

  const toggleNewProduct = () => {
    setIsNewProductPopup(!isNewProductPopup);
  };

  const toggleHoldCart = () => {
    if (cartData.length > 0) {
      setIsHoldCartPopup(!isHoldCartPopup);
    } else {
      showToast({
        message: t`No Item into the cart`,
        type: 'warning',
      });
    }
  };

  const toggleDiscountPopup = () => {
    setIsDiscountPopup(!isDiscountPopup);
  };

  const handleClearAll = () => {
    if (cartData.length > 0) {
      setIsConfirm(!isConfirm);
      dispatch(operationsActions.setConfirmStatus({ status: false }));
    } else {
      showToast({
        message: t`No Item into the cart`,
        type: 'warning',
      });
    }
  };

  const handleRemoveProduct = (item) => {
    setIsConfirm(true);
    setIsProdRemove(true);
    setSelectedProduct(item);
  };

  const editCustomer = () => {
    (!isListPopup);
    /* setIsListPopup dispatch(customerActions.setCustomerSelectStatus(false)); */
    router.replace('/customer');
  };
  const handleEditCustomer = () => {
    setEditCustomerPopup(true);

  };
  useEffect(() => {
    if (!selectedCustomer?.name) {
      if (applied_coupons) {
        dispatch(cartActions.clearCoupon(null));
      }
    }
  }, [selectedCustomer, dispatch, applied_coupons]);

  /**
   * Calculate total cart price
   */
  const cartPrice = cartData.reduce(
    (acc, current) => acc + current.subtotal,
    0
  );

  return (
    <section className={styles.section}>
      <div className={styles.section__main_container}>
        <div className={styles.container}>
          {selectedCustomer &&
            selectedCustomer.status &&
            router.route !== '/customer' ? (
            <>
              <div className={styles.selected_customer_section}>
                <div onClick={handleEditCustomer} className={styles.avatar}>
                  <div className=" p-5 avatar icon-customer-profile "></div>
                </div>
                <div className={styles.metainfo} onClick={toggleCustomerUpdate}>
                  <h5 className={styles.customer_name}>
                    {selectedCustomer.name}
                  </h5>
                  <p>{selectedCustomer.email}</p>
                </div>
              </div>
            </>
          ) : selectedCustomer &&
            selectedCustomer.status &&
            router.route === '/customer' ? (
            <div className={styles.selected_customer_section}>
              <div className={styles.avatar_disable}>
                <div className=" p-5 avatar icon-customer-profile "></div>
              </div>
              <div className={styles.metainfo}>
                <h5 className={styles.customer_name}>
                  {selectedCustomer.name}
                </h5>
                <p>{selectedCustomer.email}</p>
              </div>
            </div>
          ) : router.route === '/customer' ? (
            <div className={styles.addcustomer_disable}>
              <span className="icon icon-add"></span>
              <div>
                <h4 data-place="bottom" data-type="light">
                  <Trans> Select Customer</Trans>
                </h4>
              </div>
            </div>
          ) : (
            <div className={styles.addcustomer} onClick={editCustomer}>
              <span className="icon icon-add"></span>
              <div>
                <h4
                  data-tip="Add New Customer"
                  data-place="bottom"
                  data-type="light"
                >
                  <Trans> Select Customer</Trans>
                </h4>
              </div>
            </div>
          )}

          <div className={styles.cartControl}>
            <span
              className="icon add-person-outline icon-hover-effect"
              data-tip={t`Add Customer`}
              data-place="bottom"
              data-type="light"
              onClick={handleAddCustomerPopup}
            ></span>
            <span
              className="icon icon-cube-3d  font-20  icon-hover-effect"
              data-tip={t`Custom Product`}
              data-place="bottom"
              data-type="light"
              onClick={toggleNewProduct}
            ></span>
            <span
              className="icon icon-delete icon-hover-effect"
              data-tip={t`Clear All`}
              data-place="bottom"
              data-type="light"
              onClick={handleClearAll}
            ></span>
          </div>
        </div>

        <div className={styles.cart_item_container}>
          <ul>
            {cartData && cartData[0] !== null
              ? cartData.map((item, index) => (
                <CartItems
                  item={item}
                  key={index}
                  removeProduct={(item) => handleRemoveProduct(item)}
                />
              ))
              : ''}
          </ul>
        </div>
      </div>

      <div className={styles.section_secondary_root}>
        <div className={styles.section__secondaryContainer}>
          <div className={styles.discountWrapper}>
            <div className={styles.label}>
              <label className="mb-10">
                <Trans>Add</Trans>
              </label>
            </div>
            <div className={styles.discount_linkWrapper}>
              <label
                className="mb-10"
                onClick={toggleCouponPopup}
                data-tip={t`Coupan`}
                data-place="bottom"
                data-type="light"
              >
                <Trans>Coupon Code</Trans>
              </label>
              <label
                className="mb-10"
                onClick={toggleDiscountPopup}
                data-tip={t`Discount`}
                data-place="bottom"
                data-type="light"
              >
                <Trans>Discount</Trans>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.info_section}>
          <div className={styles.info_section_table}>
            <div className={styles.info_section_table_item}>
              <h1>
                <Trans>Sub total</Trans>
              </h1>
              <h4>
                {subTotal ? getFormattedPrice(subTotal) : getFormattedPrice(0)}
              </h4>
            </div>

            <div className={styles.info_section_table_item}>
              <h1>
                <Trans>Tax</Trans>
                {cartTax > 0 ? ` : (${taxTitle}+${taxRate}%)` : ''}
              </h1>
              <h4>
                {cartTax > 0
                  ? getFormattedPrice(cartTax)
                  : getFormattedPrice(0)}
              </h4>
            </div>

            {customCartDiscount > 0 && (
              <div className={styles.info_section_table_item}>
                <h1 className={styles.discount}>
                  <Trans>Discount</Trans>
                  {cartProducts.grandDiscountType === '%'
                    ? ` (-${cartProducts.discount}%)`
                    : ` (-${currency}${cartProducts.discount})`}
                </h1>

                <div className={styles.discount_wrap}>
                  <h4>
                    {customCartDiscount > 0
                      ? getFormattedPrice(customCartDiscount)
                      : getFormattedPrice(0)}
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
                  </h4>
                </div>
              </div>
            )}

            {applied_coupons && (
              <div className={styles.info_section_table_item}>
                <h1 className={styles.discount}>
                  <Trans>Coupon</Trans>
                  {applied_coupons.coupon_code === null
                    ? ''
                    : `(${applied_coupons.coupon_code}) `}
                  :{' '}
                  {applied_coupons.simple_action === 'by_percent'
                    ? `(-${applied_coupons.discount_amount}%)`
                    : `(-${currency}${applied_coupons.discount_amount})`}
                </h1>

                <div className={styles.discount_wrap}>
                  <h4>
                    {couponCodeVal > 0
                      ? getFormattedPrice(couponCodeVal)
                      : getFormattedPrice(0)}
                    <span
                      className="icon icon-xcircle carticon crossIcon"
                      onClick={() => dispatch(cartActions.clearCoupon(null))}
                    ></span>
                  </h4>
                </div>
              </div>
            )}

            <div className={styles.info_section_table_item}>
              <h1 className={styles.payable_amt}>
                <Trans>Payable Amount</Trans>
              </h1>
              <h4>
                {totalPayableAmount > 0
                  ? getFormattedPrice(totalPayableAmount)
                  : getFormattedPrice(0)}
              </h4>
            </div>
          </div>
          <div className={styles.section__cart_action_btn}>
            <Button
              title={t`Hold Cart`}
              hasIcon={true}
              iconClass="icon-pause-circle"
              iconBefore={true}
              clickHandler={toggleHoldCart}
              disabled={'false'}
            />
            <Button
              className={styles.pay_btn}
              title={t`Proceed`}
              buttonType="success"
              hasIcon={true}
              iconClass="icon-arrow-right-circle"
              iconBefore={true}
              clickHandler={handlePay}
              disabled={cashDrawerStatus ? 'true' : 'false'}
            />
          </div>
        </div>
      </div>

      <AddCustomer
        CustomerPopup={isCustomerPopup}
        change={(isCheck) => setIsCustomerPopup(!isCheck)}
      />

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
          storeCus
          grandTotal={totalPayableAmount}
          change={(isChecked) => {
            setIsHoldCartPopup(!isChecked);
          }}
        />
      )}

      {isDiscountPopup && (
        <Discount
          discountPopup={isDiscountPopup}
          cartPrice={cartPrice}
          change={(isCheck) => setIsDiscountPopup(!isCheck)}
          totalAmount={subTotal}
        />
      )}
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

      <ReactTooltip className={styles.pos_cart_tool_tip} />
    </section>
  );
};
