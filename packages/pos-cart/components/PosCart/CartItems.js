import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { cartActions } from '~/store/cart';
import { Input, DropDown, ConfirmBox } from '@webkul/pos-ui';
import styles from './PosCart.module.scss';
import { Trans } from '@lingui/macro';
import {
  getCurrencySymbol,
  getFormattedPrice,
  isValidString,
} from '~/utils/Helper';

import { usePosTax } from '~hooks';
import { TAX_METHOD_UNIT_BASE } from '~utils/Constants';

const CartItems = ({ item, removeProduct }) => {
  const dispatch = useDispatch();
  const currency_symbol = getCurrencySymbol();
  const {
    taxRate,
    productCalculationMethod,
    ruleProductTaxClass,
    storeProductTaxClass,
  } = usePosTax();

  const [showDetails, setShowDetails] = useState(false);
  const [discountType, setDiscountType] = useState(
    item.discount_type ? item.discount_type : '%'
  );
  const [productDiscount, setProductDiscount] = useState(
    item.discount > 0 ? parseFloat(item.discount) : 0
  );

  const cartItemTax = React.useMemo(() => {
    return (
      ruleProductTaxClass == item?.taxClassId &&
        storeProductTaxClass == ruleProductTaxClass &&
        productCalculationMethod == TAX_METHOD_UNIT_BASE
        ? (parseFloat(taxRate) / 100) * parseFloat(item?.subtotal)
        : parseFloat(0));
  }, [item, storeProductTaxClass, productCalculationMethod, ruleProductTaxClass, taxRate])

  const cartItemPrice = React.useMemo(() => {
    return parseFloat(cartItemTax) + parseFloat(item?.subtotal);
  }, [cartItemTax, item])

  const [itemFinalPrice, setItemFinalPrice] = useState(cartItemPrice);

  const [isConfirm, setIsConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const quantity = React.useMemo(() => {
    return !(item.qty % 1) ? Number(item.qty) : Number(item.qty).toFixed(2);
  }, [item])

  const quantityRender = React.useMemo(() => {
    return quantity
  }, [quantity])
  const itemBasePrice = React.useMemo(() => item.price, [item])
  let finalProductPrice = React.useMemo(() => { return (quantity * itemBasePrice); }, [itemBasePrice, quantity])

  const displayOptions = React.useMemo(() => {
    return (item?.displayOption
      ? JSON.parse(item?.displayOption)
      : '');
  }, [item])

  const cartProducts = useSelector((state) => state.cart?.quote?.items);

  const options = [
    { label: '%', value: '%' },
    { label: currency_symbol, value: currency_symbol },
  ];
  useEffect(() => {
    handleProductDiscount();
    productDiscount &&
      dispatch(
        cartActions.applyItemDiscount({
          productId: item.productId,
          discount_type: discountType,
          discount: productDiscount,
        })
      );
  }, [productDiscount, discountType]);
  //  dispatch, handleProductDiscount, item,
  useEffect(() => {
    if (item?.qty !== quantity) {
      handleProductDiscount();
    }
  }, [quantity, handleProductDiscount, item]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(cartActions.removeProduct(item.productId));
      setProductDiscount(0);
      setIsConfirm(false);

      if (cartProducts.length === 1) {
        dispatch(cartActions.clearCart());
      }
    }
  }, [isSuccess, cartProducts, dispatch, item]);

  const handleChange = (event) => {
    if (event.target.value === '0') {
      setDiscountType('%');
    } else {
      setDiscountType(event.target.value);
    }
  };

  const handleItemDiscount = (e) => {
    if (discountType === '%') {
      setProductDiscount(
        e.target.value >= 0 && e.target.value < 100 ? e.target.value : 0
      );
    } else {
      setProductDiscount(
        e.target.value >= 0 && e.target.value <= itemFinalPrice
          ? e.target.value
          : 0
      );
    }
  };

  const handleShowDetails = () => {
    setShowDetails(!showDetails);
  };
  const handleQuantityChange = (e) => {
    const qtyIncrement =
      cartProducts.is_qty_decimal && cartProducts.is_qty_inc_allowed
        ? parseFloat(cartProducts.qty_increment).toFixed(2)
        : e.target.value;
    qtyIncrement > 0 && dispatch(cartActions.updateCart({ item: item, quantity: parseFloat(qtyIncrement).toFixed(2) })); setItemFinalPrice(quantity * itemBasePrice);
  };

  const handleProductDiscount = React.useCallback(() => {
    discountType === '%' && productDiscount && quantity
      ? calculatePercentDiscount()
      : calculateFixedDiscount();
  }, [calculatePercentDiscount, calculateFixedDiscount, discountType, quantity, productDiscount]);

  const calculatePercentDiscount = React.useCallback(() => {
    const discountAmount = (finalProductPrice * productDiscount) / 100;
    calculateProductPrice(discountAmount);
  }, [productDiscount, calculateProductPrice, finalProductPrice]);

  const calculateProductPrice = React.useCallback(
    (discount = 0) => {
      const finalPricess = item.price * item.qty;
      const afterDiscountPrice = finalPricess - discount;
      setItemFinalPrice(afterDiscountPrice);
      dispatch(
        cartActions.updatePrice({ item: item, subtotal: afterDiscountPrice })
      );
    },
    [dispatch, cartProducts, item, setItemFinalPrice]
  );

  const calculateFixedDiscount = React.useCallback(() => {

    calculateProductPrice(productDiscount);
  }, [calculateProductPrice, productDiscount]);
  return (
    <>
      <li className="mb-10" key={item.productId}>
        <div
          className={`${showDetails ? styles.active_border : ''} ${styles.cart_product
            }`}
        >
          <div onClick={handleShowDetails}>
            <span className={styles.right_angle_icon}>
              <span
                className={`${showDetails
                  ? 'icon   icon-chevron-down down transition'
                  : 'icon   icon-chevron-right down  transition'
                  }`}
              ></span>
            </span>
            <span className={styles.product_meta_data}>
              <span className={styles.product_meta_data_info}>
                <span className={styles.product_meta_data_info_quantity}>
                  {parseInt(quantityRender)}
                </span>
                <h4 className={showDetails ? 'mb-10' : ''}>
                  <Trans>
                    {`${item?.name?.length <= 40
                      ? item?.name
                      : `${item?.name.slice(0, 40)}`.concat(
                        showDetails ? `` : `...`
                      )
                      } `}
                  </Trans>
                </h4>
              </span>
            </span>
          </div>

          <div className={styles.price_section}>
            <div className={styles.price_section_rate}>
              <h6 className={styles.cart_price}>
                {getFormattedPrice(item.subtotal)}
              </h6>
              <span
                className="icon icon-cross remove-icon"
                onClick={() => removeProduct(item)}
              ></span>
            </div>
          </div>
        </div>

        <div
          className={` ${showDetails ? styles.active_border : ''} ${styles.qty_price_container
            }`}
        >
          <div
            className={` ${styles.qty_price} ${showDetails ? '' : styles.hide}`}
          >
            <div className={styles.product_options}>
              <div className={styles.product_options_list}>
                {item?.name?.length > 20 && (
                  <h4>
                    <Trans>
                      {`${isValidString(item?.name) &&
                        item?.name?.substring(20, item?.name?.length - 1)
                        }`}
                    </Trans>
                  </h4>
                )}

                {<p>{getFormattedPrice(item?.price)}/units</p>}

                {Object.entries(displayOptions).map(([key, value], index) => {
                  return <span key={index}>{`${key} : ${value}`}</span>;
                })}
              </div>

              <div className={styles.product_options_container}>
                {productDiscount > 0 && (
                  <div className={styles.product_options_discount}>
                    <span className={styles.price}>
                      {getFormattedPrice(
                        parseFloat(item?.price) * parseFloat(quantityRender)
                      )}
                    </span>

                    <span className={styles.customDiscount}>
                      {`- ${productDiscount}(${discountType})`}
                    </span>
                  </div>
                )}

                {cartItemTax > 0 && (
                  <div className={styles.product_options_discount}>
                    <span className={styles.price}>
                      {getFormattedPrice(item?.subtotal)}
                    </span>
                    <span className={styles.customDiscount}>
                      {`+${taxRate}(%)`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.qty_price_section}>
              <div>
                <label className="mb-10">
                  <Trans>Quantity</Trans>
                </label>
                <Input
                  type="number"
                  placeholder=""
                  name="quantity"
                  className="product-qty"
                  value={quantityRender}
                  onChange={handleQuantityChange}
                />
              </div>
              <div>
                <label className={styles.product_discount}>
                  <Trans>Discount</Trans>
                  <span>
                    <DropDown
                      options={options}
                      value={discountType}
                      onChange={handleChange}
                      className="selectbox"
                      type="discount"
                    />
                  </span>
                </label>
                <Input
                  type="number"
                  placeholder=""
                  name="cart-product-discount"
                  className="product-discount"
                  value={productDiscount}
                  onChange={(e) => handleItemDiscount(e)}
                />
              </div>
            </div>
          </div>
        </div>
      </li>

      {isConfirm && (
        <ConfirmBox
          isConfirmPopup={isConfirm}
          title="Confirmation"
          message="Do you want to remove this product"
          change={setIsConfirm}
          onSuccess={setIsSuccess}
        />
      )}
    </>
  );
};

export default CartItems;
