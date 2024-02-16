import { useState, useEffect } from 'react';
import { db } from '~/models';
import {
  showToast,
  checkCategoryAvailable,
  isValidArray,
  isValidObject,
} from '~/utils/Helper';
import {
  DEFAULT_PAGE_SIZE,
  VISIBILITY_CATALOG,
  VISIBILITY_CATALOG_SEARCH,
} from '~utils/Constants';
import { useDispatch, useSelector } from 'react-redux';
import { searchActions } from '~/store/search';
import { t } from '@lingui/macro';
const mergeProducts = (prevProducts, products) => {
  let mergedProducts = prevProducts.concat(products);
  const productList = new Map(
    mergedProducts.map((item) => [item['entity_id'], item])
  );
  return [...productList.values()];
};
/**
 * custom hook for fetch product
 * @param {int} limit
 * @returns product
 */
export function useFetchProduct() {
  const [loading, setLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [offset, setOffset] = useState(0);
  const categoryId = useSelector((state) => state.search.search.id);
  const search = useSelector((state) => state.search.search.name);
  const config = useSelector((state) => state.storeConfig.config);
  const [isProductAvailable, setIsProductAvailable] = useState(true);
  const [limit, setLimit] = useState(
    (isValidObject(config) && config.pagesize && parseInt(config.pagesize)) ||
    DEFAULT_PAGE_SIZE
  );
  const [startPoint, setStartingPoint] = useState(0);
  const [endPoint, setEndPoint] = useState(limit);
  const dispatch = useDispatch();
  /**
   * Managing the Default Loading product list
   */
  const loadDefaultProducts = () => {
    dispatch(searchActions.filterByCategory(null));
    dispatch(searchActions.filterByName(null));
  };
  /**
   * load product and use hook useCallback
   */
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);

        let type = {
          categoryId: categoryId ? `${categoryId}` : false,
          search: search ? search : false,
        };
        const products = await db.products
          .where('visibility')
          .equals(VISIBILITY_CATALOG)
          .or('visibility')
          .equals(VISIBILITY_CATALOG_SEARCH)
          .filter(function (item) {
            return type.categoryId && !type.search
              ? item?.category_id &&
              checkCategoryAvailable(item?.category_id, type?.categoryId)
              : type.search && !type.categoryId
                ? item?.name?.toLowerCase().includes(search.toLowerCase())
                : type.categoryId && type.search
                  ? item?.category_id &&
                  checkCategoryAvailable(item?.category_id, type?.categoryId) &&
                  item?.name?.toLowerCase()?.includes(search.toLowerCase())
                  : item?.entity_id;
          })
          .filter(function (item) {
            if (item.type_id === 'configurable') {
              if (!item.configurable_product_options) {
                return false;
              }
            }
            return true;
          })
          .offset(offset)
          .limit(limit)
          .toArray();

        if (isValidArray(products)) {
          // delay the product addition to manage smooth scrolling
          offset == 0
            ? (setProductList(products), setLoading(false))
            : (setLoading(false),
              setProductList((prevList) => mergeProducts(prevList, products)));
          setIsProductAvailable(true);
        } else {
          offset == 0 && setProductList([]);
          setIsProductAvailable(false);
          setLoading(false);
        }
      } catch (err) {
        console.error(err, 'error');
        showToast({
          type: 'error',
          message: t`Unable to load More Products !!`,
        });
        setLoading(false);
      }
    }
    loadProduct();
  }, [categoryId, limit, offset, search]);
  /**
   * Managing the offset on category select and search case
   */
  useEffect(() => {
    setOffset(0);
    setIsProductAvailable(true);
  }, [categoryId, search]);
  return {
    loading,
    productList,
    setOffset,
    limit,
    offset,
    setLimit,
    isProductAvailable,
    startPoint,
    setStartingPoint,
    endPoint,
    loadDefaultProducts,
    setEndPoint,
  };
}

export const updateProductQty = () => {
  const afterOrderPlace = (orderItems) => {
    try {
      db.transaction('rw', db.products, async () => {
        orderItems.forEach((orderItem) => {
          const { availableQty } = orderItem;
          const sku = orderItem.selectedProductSku || orderItem.sku;
          db.products.where('sku').equals(sku).modify({
            quantity: availableQty,
            is_in_stock: availableQty > 0 ? 1 : 0
          });
        });
      }).catch((error) => {
        console.error('IndexedDB:', error);
      })
    } catch (err) {
      console.error(err)
    }
  }
  return { afterOrderPlace };
};