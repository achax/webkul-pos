import React, { useEffect, useState } from 'react';
import { Button, Popup, Input, OptionRenderer } from '@webkul/pos-ui';
import { useForm } from 'react-hook-form';
import styles from '../PosCart/PosCart.module.scss';
import { Trans, t } from '@lingui/macro';
import { useDispatch } from 'react-redux';
import { cartActions } from '~/store/cart';
import { db } from '~/models';
import { isValidObject, showToast } from '~/utils/Helper';
import { usePosTax } from '~hooks';

/**
 * BarCode popup component
 * @param {barcodePopup, change} props
 * @returns html
 */

const BarCodeProduct = ({
  barcodePopup,
  change,
  barCodeValue = '',
  displayPopup = true,
}) => {
  const [BarCodePopup, setBarCodePopup] = useState(barcodePopup);
  const dispatch = useDispatch();
  const [barcode, setBarCode] = useState(barCodeValue);
  const [selectedItem, setSelectedItem] = useState();
  const [productOption, setProductOptions] = useState([]);
  const [isConfigPopup, setIsConfigPopup] = useState(false);

  const {
    taxRate,
    storeProductTaxClass,
    ruleProductTaxClass,
    productCalculationMethod,
  } = usePosTax();

  /**
   * useForm Hook
   */
  const {
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setBarCodePopup(barcodePopup);
  }, [selectedItem, barcodePopup]);

  /**
   * Barcode Submit Action
   * @param {Array} data
   */
  const barcodeSubmit = async () => {
    const barcodeProduct = await db.products.get({ sku: barcode });

    isValidObject(barcodeProduct) && setSelectedItem(barcodeProduct);

    if (isValidObject(barcodeProduct)) {
      if (
        barcodeProduct.has_options === '1' &&
        barcodeProduct.type_id === 'simple'
      ) {
        setProductOptions(JSON.parse(barcodeProduct.custom_options));
        setIsConfigPopup(true);
        showToast({
          type: 'success',
          message: t`Product Item is Added Successfully !!`,
        });
      } else if (
        barcodeProduct.has_options === '1' &&
        barcodeProduct.type_id === 'configurable'
      ) {
        setProductOptions(barcodeProduct);
        setIsConfigPopup(true);
      } else {
        let product = {
          productId: barcodeProduct.entity_id,
          qty: barcodeProduct.min_sale_qty,
          price: barcodeProduct.final_price,
          max_allowed_qty: Math.min(
            barcodeProduct.quantity,
            barcodeProduct.max_sale_qty
          ),
          min_allowed_qty: barcodeProduct.min_sale_qty,
          name: barcodeProduct.name,
          sku: barcodeProduct.sku,
          subtotal: barcodeProduct.final_price,
          is_qty_decimal: barcodeProduct.is_qty_decimal,
          qty_increment: barcodeProduct.qty_increments,
          is_qty_inc_allowed: barcodeProduct.is_qty_inc_allowed,
          discount: 0,
          discount_type: '%',
          displayOption: null,
          taxRate: taxRate,
          taxableProductId: ruleProductTaxClass,
          isProductTaxable:
            storeProductTaxClass == ruleProductTaxClass &&
            ruleProductTaxClass == barcodeProduct?.tax_class_id
              ? true
              : false,
          calculationRule: productCalculationMethod,
        };

        showToast({
          type: 'success',
          message: 'Product Item is Added Successfully !!',
        });
        dispatch(cartActions.addItemToCart(product));
      }
    } else {
      showToast({ type: 'warning', message: t`Product is not found !!` });
    }

    setBarCode('');
    !displayPopup && change();
  };

  /**
   * Barcode Close button
   */
  const handleClose = () => {
    setBarCodePopup(!BarCodePopup);
    change(BarCodePopup);
  };

  return (
    <>
      {BarCodePopup && (
        <Popup close={handleClose}>
          {!isConfigPopup && (
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
                  onChange={(e) => setBarCode(e?.target?.value)}
                  value={barcode}
                />
                {errors.barcode_attribute && (
                  <p className="error">{errors.barcode_attribute.message}</p>
                )}
                <div className="popup_action">
                  <Button
                    title={t`Cancel`}
                    btnClass="button-cancel"
                    clickHandler={handleClose}
                  />
                  <Button
                    title={t`Proceed`}
                    btnClass="button-proceed"
                    type="submit"
                  />
                </div>
              </div>
            </form>
          )}

          {isConfigPopup && (
            <OptionRenderer
              filters={productOption}
              type={selectedItem?.type_id}
              name={selectedItem?.name}
              popup={setIsConfigPopup}
              product={selectedItem}
            />
          )}
        </Popup>
      )}
    </>
  );
};

export default BarCodeProduct;
