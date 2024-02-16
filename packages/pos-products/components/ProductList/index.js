import { NoDataAvailable, Popup, OptionRenderer } from '@webkul/pos-ui';
import React, { useState } from 'react';
import { isValidArray, isValidObject, showToast , EventThrottling } from '~utils/Helper';
import ProductItem from './ProductItem';
import styles from './ProductList.module.scss';
import { useFetchProduct } from '@webkul/pos-products';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useDispatch } from 'react-redux';
import { cartActions } from '~/store/cart';
import { VirtuosoGrid } from 'react-virtuoso';
import { usePosTax } from '~/hooks';
import { t } from '@lingui/macro';

export const ProductList = () => {
  const { loading, productList, isProductAvailable, setOffset, limit } =
    useFetchProduct();
  const [isConfigPopup, setIsConfigPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState();
  const [productOption, setProductOptions] = useState([]);
  const dispatch = useDispatch();
  const {
    taxRate,
    storeProductTaxClass,
    ruleProductTaxClass,
    productCalculationMethod,
  } = usePosTax();

  /**
   * handle product click and check product configure
   */
  const handleProductClick = (item) => {
      if (isValidObject(item)) {
        setSelectedItem(item);
  
        if (item.has_options === '1' && item.type_id === 'simple') {
          setProductOptions(JSON.parse(item.custom_options));
          setIsConfigPopup(true);
        } else if (item.has_options === '1' && item.type_id === 'configurable') {
          setProductOptions(item);
          setIsConfigPopup(true);
        } else {
          let selectedProduct = {
            productId: item.entity_id,
            qty: item.min_sale_qty,
            price: item.final_price,
            max_allowed_qty: Math.min(
              item.quantity,
              item.max_sale_qty
            ),
            min_allowed_qty: item.min_sale_qty,
            name: item.name,
            sku: item.sku,
            subtotal: item?.price,
            is_qty_decimal: item.is_qty_decimal,
            qty_increment: item.qty_increments,
            is_qty_inc_allowed: item.is_qty_inc_allowed,
            discount: 0,
            taxClassId: item?.tax_class_id,
            discount_type: '%',
            displayOption: null,
            selectedProductSku: item?.sku,
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
          dispatch(cartActions.addItemToCart(selectedProduct))
        }
      }
  };

  const fetchMore = () => {
    setOffset((offset) => offset + limit);
  };

  return (
    <React.Fragment>
      <div className={styles.product_selector}>
        <AutoSizer>
          {({ height, width }) => (
            <>
              <VirtuosoGrid
                style={{ height: height, width: width }}
                totalCount={productList.length}
                endReached={fetchMore}
                itemContent={(index) => (
                  <ProductItem
                    item={productList[index]}
                    onClick={(item) => handleProductClick(item)}
                  />
                )}
                listClassName={styles.product_list}
              />
            </>
          )}
        </AutoSizer>
      </div>

      {!isProductAvailable && !isValidArray(productList) && !loading ? (
        <div className={styles.no_data_available}>
          <NoDataAvailable
            width={200}
            height={200}
            isDescReq={true}
            heading={t`Product not found`}
            descriptions={t`Product not found pls check the product availablity`}
          />
        </div>
      ) : (
        ''
      )}

      {isConfigPopup && isValidObject(selectedItem) && (
        <Popup>
          <OptionRenderer
            filters={productOption}
            type={selectedItem?.type_id}
            name={selectedItem?.name}
            popup={setIsConfigPopup}
            product={selectedItem}
          />
        </Popup>
      )}
    </React.Fragment>
  );
};
