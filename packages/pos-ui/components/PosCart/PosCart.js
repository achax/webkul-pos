import React, { useState } from 'react';
import styles from './PosCart.module.scss';
import { Button, Popup, Input } from '@webkul/pos-ui';
import CartItems from './CartItems';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { cartActions } from '~/store/cart';
import { useForm } from 'react-hook-form';
import { db } from '~/models';
import Image from 'next/image';
import { showToast, isValidObject } from '~/utils/Helper';
import { holdCartActions } from '~/store/holdCart';
import { CouponsList } from '@webkul/pos-coupon';
import { Trans, t } from '@lingui/macro';
export const PosCart = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isBarCodePopup, setIsBarCodePopup] = useState(false);
  const [isNewProductPopup, setIsNewProductPopup] = useState(false);
  const [isHoldCardPopup, setIsHoldCardPopup] = useState(false);
  const [isDiscountPopup, setIsDiscountPopup] = useState(false);
  const [isCouponPopup, setIsCouponPopup] = useState(false);
  const [
    ,
    // couponCode
    setCouponCode,
  ] = useState('');
  const [discountSelect, setDiscountSelect] = useState('$');
  const cartProducts = useSelector((state) => state.cart?.quote);
  const selectedCustomer = useSelector(
    (state) => state.customer?.selectedCustomer
  );

  let discount;

  const applied_coupons = useSelector(
    (state) => state.cart?.quote?.applied_coupons || []
  );

  const toggleCouponPopup = () => {
    setIsCouponPopup(!isCouponPopup);
  };

  const {
    register,
    handleSubmit,
    setValue,
    // formState: { errors },
  } = useForm();

  const discountHandler = () => {
    discountSelect === '$' ? setDiscountSelect('%') : setDiscountSelect('$');
    setValue('type', discountSelect);
  };

  const handlePay = () => {
    cartProducts.items.length > 0
      ? router.push('./pay')
      : showToast({ message: t`Cart Empty!!`, type: 'error' });
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
      setIsHoldCardPopup(!isHoldCardPopup);
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

  const selectedItem = (data) => {
    const selectedItem = data && {
      productId: data.entity_id
        ? data.entity_id
        : Math.floor(Date.now() + Math.random()),
      qty: data.min_sale_qty ? data.min_sale_qty : 1,
      options: null,
      displayOptions: null,
      price: data.price,
      max_allowed_qty: Math.min(data.quantity, data.max_sale_qty),
      min_allowed_qty: data.min_sale_qty ? data.min_sale_qty : 1,
      name: data.name,
      sku: data.name,
      subtotal: data.price,
    };
    return selectedItem;
  };

  const holdCartItem = (data) => {
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
      items: cartData,
      note: data.note,
      currency_code: null,
      grand_total: TotalPayable,
      base_grand_total: TotalPayable,
      cashier_id: 1,
      outlet_id: 1,
    };
    return holdData;
  };

  const discountType = cartProducts.grandDiscountType;
  const discountValue = cartProducts.discount ? cartProducts.discount : 0;
  const cartData = cartProducts.items;

  const cartPrice = cartData.reduce(
    (acc, current) => acc + current.subtotal,
    0
  );

  const cartTax = 0;

  if (discountType === '%') {
    discount = (cartPrice * discountValue) / 100;
  } else {
    discount = discountValue;
  }

  let TotalPayable = cartPrice ? cartPrice + cartTax - discount : 0;
  let couponDiscountAmount;

  const couponDiscount = isValidObject(applied_coupons)
    ? applied_coupons.discount_amount
    : 0;

  if (applied_coupons.simple_action === 'by_percent') {
    couponDiscountAmount = (TotalPayable * couponDiscount) / 100;
    TotalPayable = TotalPayable - (TotalPayable * couponDiscount) / 100;
  } else {
    couponDiscountAmount = couponDiscount;
    TotalPayable = TotalPayable - couponDiscount;
  }

  const onSubmit = async (data) => {
    let selectedProduct = selectedItem(data);
    dispatch(cartActions.addItemToCart(selectedProduct));
    setIsNewProductPopup(!isNewProductPopup);
  };

  const couponSubmit = async (data) => {
    setCouponCode(data.coupon);
  };

  const barcodeSubmit = async (data) => {
    const barcodeProductData = {
      barcode_attribute: data.barcode_attribute,
    };
    const barcodeProduct = await db.products.where(barcodeProductData).first();
    let selectedProduct = selectedItem(barcodeProduct);
    dispatch(cartActions.addItemToCart(selectedProduct));
    setIsBarCodePopup(!isBarCodePopup);
  };

  const discountSubmit = async (data) => {
    if (data.discount > '0' && cartData.length > 0) {
      dispatch(cartActions.applyDiscount(data));
      setIsDiscountPopup(!isDiscountPopup);
      showToast({ message: t`Discount Applied!!`, type: 'success' });
    } else {
      showToast({
        message: t`Please check cart or discount value`,
        type: 'error',
      });
    }
  };

  const holdCartSubmit = async (data) => {
    dispatch(holdCartActions.setHoldCart(holdCartItem(data)));
    dispatch(cartActions.clearCart());
    setIsHoldCardPopup(!isHoldCardPopup);
  };

  return (
    <section className={styles.section}>
      <div className={styles.section__main_container}>
        <div className={styles.container}>
          {selectedCustomer.status ? (
            <>
              <div className={styles.avatar}>
                <Image
                  alt="search"
                  width={125}
                  height={125}
                  src="/assets/images/login-user.png"
                />
              </div>
              <div className={styles.metainfo}>
                <h5 className={styles.customer_name}>
                  {selectedCustomer.billing_firstname}{' '}
                  {selectedCustomer.billing_lastname}
                </h5>
                <p>{selectedCustomer.email}</p>
              </div>
            </>
          ) : (
            <div className={styles.addcustomer} onClick={handleAddCustomer}>
              <span className="icon icon-add"></span>
              <div>
                <h4>
                  <Trans> Add Customer</Trans>
                </h4>
              </div>
            </div>
          )}
          <div className={styles.cartControl}>
            <span className="icon icon-add" onClick={toggleNewProduct}></span>
            <span className="icon icon-barcode" onClick={toggleBarcode}></span>
            <span
              className="icon icon-reset"
              onClick={() => dispatch(cartActions.clearCart())}
            ></span>
          </div>
        </div>
        <ul>
          {cartData
            ? cartData.map((item, index) => (
                <CartItems item={item} key={index} />
              ))
            : ''}
        </ul>
      </div>
      <div className={styles.section__secondaryContainer}>
        <div className={styles.discountWrapper}>
          <div className={styles.label}>
            <label className="mb-10">
              <Trans>Add</Trans>
            </label>
          </div>
          <div className={styles.discount_linkWrapper}>
            <label className="mb-10" onClick={toggleDiscountPopup}>
              <Trans>Discount</Trans>
            </label>
            <label className="mb-10" onClick={toggleCouponPopup}>
              <Trans>Coupon Code</Trans>
            </label>
          </div>
        </div>
      </div>
      <table className="mb-10">
        <tbody>
          <tr>
            <td>
              <Trans>Sub total</Trans>
            </td>
            <td>${cartPrice}</td>
          </tr>
          <tr>
            <td>
              <Trans>Tax</Trans>
            </td>
            <td>${cartTax}</td>
          </tr>
          {discount > 0 && (
            <tr className={styles.couponStatus}>
              <td className={styles.coupon} onClick={toggleDiscountPopup}>
                <Trans>Discount</Trans>
              </td>
              <td>
                {discountType} {discount}
              </td>
              <span
                className="icon icon-xcircle carticon crossIcon"
                onClick={() =>
                  dispatch(
                    cartActions.applyDiscount({ discount: null, type: null })
                  )
                }
              ></span>
            </tr>
          )}
          {isValidObject(applied_coupons) && applied_coupons.coupon_code && (
            <tr className={styles.couponStatus}>
              <td className={styles.coupon} onClick={toggleCouponPopup}>
                <Trans>Coupon ({applied_coupons.coupon_code}) </Trans>
              </td>
              <td>{-couponDiscountAmount} </td>
              <span
                className="icon icon-xcircle carticon crossIcon"
                onClick={() => dispatch(cartActions.clearCoupon([]))}
              ></span>
            </tr>
          )}

          <tr>
            <td className={styles.grand_total}>
              <Trans>Payable Amount</Trans>
            </td>
            <td className={styles.grand_total}>${TotalPayable}</td>
          </tr>
        </tbody>
      </table>
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
          title={t`Proceed`}
          buttonType="success"
          hasIcon={true}
          iconClass="icon-arrow-right-circle"
          iconBefore={true}
          clickHandler={handlePay}
          disabled={'false'}
        />
      </div>
      {isBarCodePopup && (
        <Popup>
          <form
            className={styles.popup_form}
            onSubmit={handleSubmit(barcodeSubmit)}
          >
            <div className={styles.barcode_form}>
              <label>
                <Trans>Scan or Enter Barcode</Trans>
              </label>
              <Input
                type="text"
                placeholder={t`Enter the barcode of the product`}
                name="barcode"
                className="barcode-box"
                {...register('barcode_attribute')}
              />
              <div className="popup_action">
                <Button
                  title={t`Cancel`}
                  btnClass={'button-cancel'}
                  clickHandler={toggleBarcode}
                />
                <Button
                  title={t`Proceed`}
                  btnClass={'button-proceed'}
                  type="submit"
                />
              </div>
            </div>
          </form>
        </Popup>
      )}

      {isCouponPopup && (
        <Popup>
          <form
            className={styles.popup_form}
            onSubmit={handleSubmit(couponSubmit)}
          >
            <div className={styles.barcode_form}>
              <label>
                <Trans>Enter Coupon Code</Trans>
              </label>
              <Input
                type="text"
                placeholder={t`Enter the code`}
                name="coupon"
                className="coupon_box"
                {...register('coupon')}
              />
              <div className="popup_list">
                <CouponsList />
              </div>
              <div className="popup_action">
                <Button
                  title={t`Cancel`}
                  btnClass={'button-cancel'}
                  clickHandler={toggleCouponPopup}
                />
                <Button
                  title={t`Proceed`}
                  btnClass={'button-proceed'}
                  type="submit"
                />
              </div>
            </div>
          </form>
        </Popup>
      )}

      {isNewProductPopup && (
        <Popup>
          <form className={styles.popup_form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.newproduct_form}>
              <label>
                <Trans>Add New Product</Trans>
              </label>
              <hr />
              <div className={styles.product_name}>
                <h4>
                  <Trans>Product Name</Trans>
                </h4>
                <Input
                  type="text"
                  placeholder={t`Enter the custom product name`}
                  name="custom-product-name"
                  className="product-name"
                  {...register('name')}
                />
              </div>
              <div className={styles.product_price}>
                <h4>
                  <Trans>Product Price</Trans>
                </h4>
                <Input
                  type="number"
                  placeholder={t`Enter the product price`}
                  name="custom-product-price"
                  className="product-price"
                  {...register('price')}
                />
              </div>

              <div className="popup_action">
                <Button
                  title={t`Cancel`}
                  btnClass={'button-cancel'}
                  clickHandler={toggleNewProduct}
                />
                <Button
                  title={t`Add To Cart`}
                  btnClass={'button-proceed'}
                  type="submit"
                />
              </div>
            </div>
          </form>
        </Popup>
      )}

      {isHoldCardPopup && (
        <Popup>
          <form
            className={styles.popup_form}
            onSubmit={handleSubmit(holdCartSubmit)}
          >
            <div className={styles.holdcart_form}>
              <label>{<Trans>Hold Cart</Trans>}</label>
              <hr />
              <div className={styles.holdcart}>
                <h4>{<Trans>Add Order Note here</Trans>}</h4>
                <Input
                  type="text"
                  placeholder={t`Enter the note for holding cart`}
                  name="hold-cart"
                  className="hold-cart"
                  {...register('note')}
                />
              </div>
              <div className="popup_action">
                <Button
                  title={t`Cancel`}
                  btnClass={'button-cancel'}
                  clickHandler={toggleHoldCart}
                />
                <Button
                  title={t`Add Order Note Here `}
                  btnClass={'button-proceed'}
                  type="submit"
                />
              </div>
            </div>
          </form>
        </Popup>
      )}

      {isDiscountPopup && (
        <Popup box="discount">
          <form
            className={styles.popup_form}
            onSubmit={handleSubmit(discountSubmit)}
          >
            <div className="discount-wrap">
              <label>
                <Trans>Add Discount</Trans>
              </label>
              <div className="discount_form">
                <span
                  className={`currency ${
                    discountSelect === '$' ? 'selected' : ''
                  }`}
                  onClick={discountHandler}
                >
                  $
                </span>
                <span
                  className={`percent ${
                    discountSelect === '$' ? '' : 'selected'
                  }`}
                  onClick={discountHandler}
                >
                  %
                </span>

                <Input
                  type="text"
                  placeholder=""
                  name="discountcart"
                  className="discount-cart"
                  {...register('discount')}
                />
                <Input
                  type="hidden"
                  name="hiddencart"
                  className="hidden-cart"
                  {...register('type')}
                />
                <span className="discountIcon">{discountSelect}</span>
              </div>
              <div className="popup_action">
                <Button
                  title={t`Cancel`}
                  btnClass={'button-cancel'}
                  clickHandler={toggleDiscountPopup}
                />
                <Button
                  title={t`Proceed`}
                  btnClass={'button-proceed'}
                  type="submit"
                />
              </div>
            </div>
          </form>
        </Popup>
      )}
    </section>
  );
};
