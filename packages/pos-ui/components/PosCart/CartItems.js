// import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { cartActions } from '~/store/cart';
import { Input, DropDown } from '@webkul/pos-ui';
import styles from './PosCart.module.scss';
import { Trans } from '@lingui/macro';

const options = [
  { label: '%', value: '%' },
  { label: '$', value: '$' },
];

const CartItems = ({ item }) => {
  const dispatch = useDispatch();

  const [showDetails, setShowDetails] = useState(false);
  const [discountType, setDiscountType] = useState('%');
  const [productDiscount, setProductDiscount] = useState(0);
  const [itemFinalPrice, setItemFinalPrice] = useState(item.price);

  const quantity = item.qty;
  const itemBasePrice = item.price;
  let finalProductPrice = quantity * itemBasePrice;
  const productOptions =
    // item.options != null ? Object.entries(item.displayOptions) : '';
    item.options ? Object.entries(item.displayOptions) : '';

  const cartProducts = useSelector((state) => state.cart?.quote?.items);

  useEffect(() => {
    handleProductDiscount();
  }, [productDiscount, handleProductDiscount, discountType]);

  useEffect(() => {
    handleProductDiscount();
  }, [quantity, itemFinalPrice, handleProductDiscount]);

  const handleChange = (event) => {
    setDiscountType(event.target.value);
  };

  const handleShowDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleQuantityChange = (e) => {
    const qtyIncrement =
      cartProducts.is_qty_decimal && cartProducts.is_qty_inc_allowed
        ? cartProducts.qty_increment
        : e.target.value;
    dispatch(cartActions.updateCart({ item: item, quantity: qtyIncrement }));
    setItemFinalPrice(quantity * itemBasePrice);
  };

  const handleProductDiscount = React.useCallback(() => {
    discountType === '%'
      ? calculatePercentDiscount()
      : calculateFixedDiscount();
  }, [discountType, calculatePercentDiscount, calculateFixedDiscount]);
  const calculatePercentDiscount = React.useCallback(() => {
    const discountAmount = (finalProductPrice * productDiscount) / 100;
    calculateProductPrice(discountAmount);
  }, [finalProductPrice, calculateProductPrice, productDiscount]);

  const calculateProductPrice = React.useCallback(
    (discount = 0) => {
      const afterDiscountPrice = finalProductPrice - discount;
      setItemFinalPrice(afterDiscountPrice);
      dispatch(
        cartActions.updatePrice({ item: item, subtotal: afterDiscountPrice })
      );
    },
    [dispatch, item, finalProductPrice]
  );

  const calculateFixedDiscount = React.useCallback(() => {
    calculateProductPrice(productDiscount);
  }, [calculateProductPrice, productDiscount]);
  return (
    <>
      <li className="mb-10" key={item.productId}>
        <div className={styles.cart_product}>
          <div onClick={handleShowDetails}>
            <span className="icon icon-chevron-right "></span>
            <span>
              <h4>
                <span>{quantity}</span>
                <Trans>{item.name}</Trans>
              </h4>
              {productOptions &&
                productOptions.map((item, index) => (
                  <span className="font-12 product_options" key={index}>
                    {item[1] ? (
                      <label>
                        {item[0]} : {item[1]}
                      </label>
                    ) : (
                      ''
                    )}
                  </span>
                ))}
            </span>
          </div>
          <div>
            <span className={styles.cart_price}>
              ${itemFinalPrice} ( <Trans>ex.tax</Trans> )
            </span>
            <span
              className="icon icon-xcircle carticon"
              onClick={() =>
                dispatch(cartActions.removeProduct(item.productId))
              }
            ></span>
          </div>
        </div>
        <div
          className={`${styles.qty_price} ${showDetails ? '' : styles.hide}`}
        >
          <div>
            <label className="mb-10">
              <Trans>Quantity</Trans>
            </label>
            <Input
              type="number"
              placeholder=""
              name="quantity"
              className="product-qty"
              value={quantity}
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
              onChange={(e) =>
                setProductDiscount(e.target.value > 0 ? e.target.value : 0)
              }
            />
          </div>
        </div>
      </li>
    </>
  );
};

export default CartItems;
