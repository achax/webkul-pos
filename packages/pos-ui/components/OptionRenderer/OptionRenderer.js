import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DropDown, Input, RadioButton, Button } from '@webkul/pos-ui';
import { useDispatch } from 'react-redux';
import { cartActions } from '~/store/cart';
import { useForm } from 'react-hook-form';
import styles from '~/packages/pos-products/components/ProductList/ProductItem.module.scss';
import { getFormattedPrice, isValidArray, isValidObject } from '~/utils/Helper';
import { db } from '~/models';
import { usePosTax } from '~/hooks';
import { t } from '@lingui/macro';

export const OptionRenderer = (props) => {
  const [date, setDate] = useState('');
  const [value, setValue] = useState(false);
  const [checkValue, setCheckValue] = useState(false);
  const [selectValue, setSelectValue] = useState(0);
  const [itemPrice, setItemPrice] = useState(props.product.final_price);
  const [productId, setProductId] = useState();
  const [childProductSKU, setChildProductSKU] = useState();
  const [products, setProducts] = useState();
  const {
    taxRate,
    productCalculationMethod,
    ruleProductTaxClass,
    storeProductTaxClass,
  } = usePosTax();

  const dispatch = useDispatch();
  const item = props.product;
  const productFinalPrice = props.product.final_price;
  const fieldRef = useRef(null);
  // let childProduct;
  let configOption = {};

  /**
   * Get All data from DB
   */
  useEffect(() => {
    async function getProducts() {
      const allProducts = await db.products.toArray();
      if (allProducts) {
        setProducts(allProducts);
        return allProducts;
      }
    }
    if (!products) getProducts();
  }, [products, productId]);

  /**
   * Form Hook.
   */
  const { register, handleSubmit, watch, formState } = useForm({
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const {
    // isValid,
    errors,
  } = formState;

  const formValues = watch();
  const type = props.type;
  // let filters = [];
  // let superAttributeData;
  // let configSKU;

  const superAttributeData = React.useMemo(() => {
    if (type === 'configurable') {
      return props.filters.configurable_super_attributes;
    }
  }, [type, props]);
  const childProduct = React.useMemo(() => {
    if (type === 'configurable') {
      return JSON.parse(props.filters.configurable_product_options);
    }
  }, [props, type]);

  const filters = React.useMemo(() => {
    return type === 'simple' ? props.filters : JSON.parse(superAttributeData);
  }, [props, type, superAttributeData]);

  useEffect(() => {
    let configSKU;
    let displayValue = {};
    let formData = {};
    if (type === 'configurable') {
      Object.entries(filters).forEach((item) => {
        const itemOption = item[1].values.find((data) =>
          data.value_index === formValues[item[0]] ? data.label : ''
        );
        displayValue[item[1].label] = itemOption && itemOption.label;
      });

      Object.entries(formValues).forEach((item) => {
        formData[item[0]] = parseInt(item[1]);
      });

      const configProductId = getProductKey(childProduct.index, formData);
      configProductId && setProductId(configProductId[0]);

      configSKU = getProductSKU(productId);
      configSKU ? setChildProductSKU(configSKU.sku) : '';

      const productPrice =
        configProductId &&
        getConfigPrice(childProduct.optionPrices, configProductId[0]);

      productPrice && setItemPrice(parseInt(productPrice[1]));
    }

    function getProductKey(obj, value) {
      return Object.entries(obj).find((item) =>
        JSON.stringify(item[1]) == JSON.stringify(value) ? item[0] : ''
      );
    }

    function getProductSKU(value) {
      const selectedItem =
        products && products.find((item) => item.entity_id == value);
      return selectedItem;
    }

    function getConfigPrice(obj, value) {
      return Object.entries(obj).find((item) =>
        JSON.stringify(item[0]) === JSON.stringify(value) ? item : ''
      );
    }
  }, [
    childProduct,
    filters,
    formValues,
    productId,
    type,
    products,
  ]);

  useEffect(() => {
    const getPrice = () => {
      type === 'simple' &&
        filters.map(
          (item) =>
            item.values &&
            item.values.map((childItem) => {
              if (selectValue === '0') {
                !itemPrice
                  ? setItemPrice(productFinalPrice)
                  : setItemPrice(itemPrice);
              }
              if (childItem.label === selectValue) {
                setItemPrice(
                  parseInt(productFinalPrice) + parseInt(childItem.price)
                );
              }
            })
        );
    };

    getPrice();
  }, [selectValue, productFinalPrice, filters, itemPrice, type]);

  const handleChange = (e) => {
    e.target.value ? setSelectValue(e.target.value) : '';
  };

  const handleClick = () => {
    props.popup(false);
  };

  const handleCheckChange = () => {
    setCheckValue(!checkValue);
  };

  const handleRadioChange = () => {
    setValue(!value);
  };

  const handlePriceUpdate = useCallback(
    (e) => {
      const fieldPriceValue = parseInt(fieldRef.current.value);
      if (e.target.value != '') {
        setItemPrice(parseInt(itemPrice) + fieldPriceValue);
        setSelectValue(e.target.value);
      } else {
        setSelectValue(0);
      }
    },
    [itemPrice]
  );

  const handleFieldChange = (e) => {
    const fieldPriceValue = parseInt(fieldRef.current.value);
    setSelectValue(e.target.value);
    e.target.value
      ? handlePriceUpdate(e)
      : setItemPrice(parseInt(itemPrice) - fieldPriceValue);
  };

  const onDateChange = (e) => {
    setDate(e.target.value);
  };

  const onSubmit = async (data) => {
    const optionObject = Object.entries(data).map((item) => {
      return { option_id: item[0], option_value: item[1] };
    });

    let productOption = {
      extension_attributes: {
        custom_options: optionObject,
      },
    };

    let options = {};
    let selectedChildSku = childProductSKU ? childProductSKU : item.sku;

    isValidObject(data) &&
      Object.keys(data).map((item, index) => {
        let val =
          isValidArray(filters[item]?.options) &&
          filters[item]?.options?.find((res) => {
            if (res?.value == Object.values(data)[index]) {
              return res;
            }
          });
        options[Object.values(filters)[index]['label']] = val?.label;
      });

    Object.values(options)
      .reverse()
      .map((item) => {
        selectedChildSku = selectedChildSku.concat(`-${item}`);
      });

    let selectedItem = {
      productId: productId ? productId : item.entity_id,
      qty: item.min_sale_qty,
      product_option: productOption,
      selectedChildSku: selectedChildSku ? selectedChildSku : '',
      displayOption:
        Object.keys(options).length === 0
          ? JSON.stringify(data)
          : JSON.stringify(options),
      price: itemPrice,
      max_allowed_qty: item.max_sale_qty,
      min_allowed_qty: item.min_sale_qty,
      name: item.name,
      sku: childProductSKU ? childProductSKU : item.sku,
      subtotal: item.final_price,
      is_qty_decimal: item.is_qty_decimal,
      qty_increment: item.qty_increments,
      is_qty_inc_allowed: item.is_qty_inc_allowed,
      discount: 0,
      taxClassId: item?.tax_class_id,
      discount_type: '%',
      typeId: item?.type_id,
      taxRate: taxRate,
      taxableProductId: ruleProductTaxClass,
      isProductTaxable:
        storeProductTaxClass == ruleProductTaxClass &&
          ruleProductTaxClass == item?.tax_class_id
          ? true
          : false,
      calculationRule: productCalculationMethod,
    };
    if (item.type_id === 'configurable') {
      const selectedProduct = await db.products
        .where({ sku: selectedChildSku })
        .first();

      if (isValidObject(selectedProduct)) {
        selectedItem.max_allowed_qty = Math.min(
          selectedProduct.quantity,
          selectedProduct.max_sale_qty
        )
        selectedItem.min_allowed_qty = selectedProduct.min_sale_qty;
      }
    }

    dispatch(cartActions.addItemToCart(selectedItem));
    handleClick();
  };

  return (
    <>
      <form className={styles.popup_form} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.barcode_form}>
          <div className={styles.head}>
            <h3>{props.name}</h3>
            <h3 className={styles.price}>
              {itemPrice > 0 && getFormattedPrice(itemPrice)}
            </h3>
          </div>
          <hr />
          {type === 'configurable' &&
            Object.entries(filters).map((filter, index) => (
              <React.Fragment key={index}>
                {filter[1].values?.map((item) => {
                  configOption[filter[0]] = parseInt(item.value_index);
                })}
                {
                  <DropDown
                    label={filter[1].frontend_label}
                    options={filter[1].values}
                    className="selectbox"
                    errorMsg={errors[filter[0]]?.message}
                    {...register(filter[0], {
                      required: t`This option is required!!`,
                    })}
                    type="config"
                  />
                }
              </React.Fragment>
            ))}
          {type === 'simple' &&
            filters.map((filter) =>
              filter.type === 'field' ? (
                <React.Fragment key={`${filter.value}_${filter.option_id}`}>
                  <Input
                    title={filter.title}
                    type={'text'}
                    name={filter.title}
                    value={filter.value}
                    placeholder={filter.title}
                    errorMsg={errors[filter.title]?.message}
                    event={handleFieldChange}
                    {...register(
                      filter.option_id,
                      filter.require && {
                        required: t`This is required`,
                      }
                    )}
                  />
                  <Input
                    type={'hidden'}
                    name={filter.hiddenfield}
                    value={filter.price}
                    ref={fieldRef}
                  />
                </React.Fragment>
              ) : filter.type === 'drop_down' ? (
                <DropDown
                  label={filter.title}
                  options={filter.values}
                  name={filter.title}
                  classname={'selectbox'}
                  errorMsg={errors[filter.title]?.message}
                  {...register(filter.option_id, {
                    required: t`This is required`,
                  })}
                  onChange={handleChange}
                  type="simple"
                />
              ) : filter.type === 'date' ? (
                <Input
                  title={filter.title}
                  type={'date'}
                  name={filter.name}
                  value={date}
                  placeholder={filter.title}
                  onChange={onDateChange}
                />
              ) : filter.type === 'checkbox' ? (
                <RadioButton
                  type={'checkbox'}
                  label={filter.title}
                  value={checkValue}
                  options={filter.values}
                  onChange={handleCheckChange}
                />
              ) : filter.type === 'radio' ? (
                <RadioButton
                  type={'radio'}
                  label={filter.title}
                  value={value}
                  options={filter.values}
                  onChange={handleRadioChange}
                />
              ) : (
                ''
              )
            )}
          <div className="popup_action">
            <Button
              title={t`Cancel`}
              btnClass={'button-cancel'}
              clickHandler={handleClick}
            />
            <Button
              title={t`Add To Cart`}
              type="submit"
              btnClass={'button-proceed'}
            />
          </div>
        </div>
      </form>
    </>
  );
};
