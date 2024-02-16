import React, { useState, useEffect } from 'react';
import { Button, Popup, Input } from '@webkul/pos-ui';
import { useForm } from 'react-hook-form';
import styles from '../PosCart/PosCart.module.scss';
import { Trans, t } from '@lingui/macro';
import { useDispatch } from 'react-redux';
import { cartActions } from '~/store/cart';
import { selectedCustomItem, showToast } from '~/utils/Helper';
import { usePosTax } from '~/hooks';

/**
 * CustomProduct popup component
 * @param {object} props
 * @returns html
 */
const CustomProduct = ({ newProductPopup, change }) => {
  const [customProductPopup, setCustomProductPopup] = useState(newProductPopup);
  const dispatch = useDispatch();
  const { taxRate, ruleProductTaxClass, productCalculationMethod } =
    usePosTax();

  useEffect(() => {
    setFocus('name');
  }, [setFocus]);

  /**
   * useForm Hook
   */
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm();

  /**
   * CustomProduct Submit Action
   * @param {Array} data
   */
  const customProductSubmit = async (data) => {
    let selectedProduct =
      data &&
      selectedCustomItem(
        data,
        taxRate,
        productCalculationMethod,
        ruleProductTaxClass
      );

    selectedProduct && dispatch(cartActions.addItemToCart(selectedProduct));
    showToast({
      type: 'success',
      message: t`Product Item is Added Successfully !!`,
    });
    handleClose();
  };

  /**
   * CustomProduct Close button
   */
  const handleClose = () => {
    setCustomProductPopup((customProductPopup) => !customProductPopup);
    change(customProductPopup);
  };

  return (
    <>
      {customProductPopup && (
        <Popup box="category" close={handleClose}>
          <form
            className={styles.popup_form}
            onSubmit={handleSubmit(customProductSubmit)}
          >
            <div className={styles.newproduct_form}>
              <label className="mb-0">
                <Trans>Add New Product</Trans>
              </label>
              <hr />
              <div className={styles.custom_product_form}>
                <div className={styles.product_name}>
                  <h4>
                    <Trans>Product Name</Trans>
                  </h4>
                  <Input
                    type="text"
                    placeholder={t`Enter the custom product name`}
                    name="custom-product-name"
                    className="product-name"
                    {...register('name', {
                      required: t`Custom product name is required.`,
                    })}
                  />
                  {errors.name && (
                    <li className="error">{errors.name.message}</li>
                  )}
                </div>
                <div className={styles.product_price}>
                  <h4>
                    <Trans>Product Price</Trans>
                  </h4>
                  <Input
                    type="number"
                    placeholder={t`Enter the custom product price`}
                    name="custom-product-price"
                    className="product-price"
                    {...register('price', {
                      required: t`Custom product price is required.`,
                    })}
                  />
                  {errors.price && (
                    <li className="error">{errors.price.message}</li>
                  )}
                </div>

                <div className={styles.product_price}>
                  <h4>
                    <Trans>Product Quantity</Trans>
                  </h4>
                  <Input
                    type="number"
                    placeholder={t`Enter the custom product quantity`}
                    name="custom-product-price"
                    className="product-price"
                    {...register('quantity', {
                      required: t`Custom product quantity is required.`,
                    })}
                  />
                  {errors.quantity && (
                    <li className="error">{errors.quantity.message}</li>
                  )}
                </div>

                <div className={styles.product_price}>
                  <h4>
                    <Trans>Product Note</Trans>
                  </h4>
                  <Input
                    type="text"
                    placeholder={t`Enter the custom product note`}
                    name="custom-product-price"
                    className="product-price"
                    {...register('note', {
                      required: t`Custom product note is required.`,
                    })}
                  />
                  {errors.note && (
                    <li className="error">{errors.note.message}</li>
                  )}
                </div>

                <div className={styles.product_btn}>
                  <div className="popup_action">
                    <Button
                      title={t`Cancel`}
                      btnClass={'button-cancel'}
                      clickHandler={handleClose}
                    />
                    <Button
                      title={t`Add To Cart`}
                      btnClass={'button-proceed'}
                      type="submit"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Popup>
      )}
    </>
  );
};

export default CustomProduct;
