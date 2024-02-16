import { createSlice } from '@reduxjs/toolkit';
import { xh } from 'make-plural';
import { db } from '~/models';
import { isValidArray, isValidObject, showToast } from '~/utils/Helper';
import { t } from '@lingui/macro';
let cartData = [];
let incrementQty;

/**
 * Initializing the state
 */
const initialCartState = {
  quote: {
    quoteId: cartData.quoteId || null,
    items: cartData.items || [],
    applied_coupons: cartData.applied_coupons || null,
    discount: cartData.discount || null,
    grandDiscount: cartData.grandDiscount || null,
    grandDiscountType: cartData.grandDiscountType || null,
    taxRate: cartData.taxRate || null,
    cashierId: cartData.cashierId || null,
    calculationRule: cartData.calculationRule,
  },
  quoteId: cartData.quoteId || null,
  message: null,
};

const qtyValidation = (currItem) => {
  if (currItem) {
    if (
      currItem.qty >= currItem.max_allowed_qty ||
      currItem.qty < currItem.min_allowed_qty
    ) {
      showToast({ message: t`Product Qty is not allowed`, type: 'error' });
      return true;

    } else {
      const incrementQty = currItem.is_qty_decimal ? currItem.qty_increment : 1;
      currItem.qty = currItem.qty + incrementQty;
      showToast({
        type: 'success',
        message: t`Product Item is Added Successfully !!`,
      });
      return currItem;
    }
  }
  return false;
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    /**
     * Add Item to cart
     *
     * @param {*} state
     * @param {*} action
     */
    addItemToCart(state, action) {
      if (state.quoteId === null) {
        state.quoteId = Math.floor(Date.now() + Math.random());
        state.quote.quoteId = state.quoteId;
      }

      const selectItem = action.payload;

      state.quote['taxRate'] = action?.payload?.taxRate;
      state.quote['taxClassId'] = action?.payload?.taxClassId;
      state.quote['calculationRule'] = action?.payload?.calculationRule;
      let currItem =
        isValidObject(selectItem) &&
        state.quote.items.find((obj) => obj.sku === selectItem.sku);

      let isProdUnique = true;

      if (isValidObject(currItem)) {
        isProdUnique = false;
        if (
          selectItem.type_id === 'configurable' &&
          selectItem.selectedChildSku !== currItem.selectedChildSku
        ) {
          isProdUnique = true;
        }

        if (
          JSON.stringify(currItem?.product_option) ===
          JSON.stringify(selectItem?.product_option)
        ) {
          isProdUnique = false;
        }
      }
      if (!isProdUnique) {
        qtyValidation(currItem);
      } else {
        state.quote.items = [...state.quote.items, selectItem];
        showToast({
          type: 'success',
          message: t`Product Item is Added Successfully !!`,
        });
      }
      db.cart.put(JSON.parse(JSON.stringify(state.quote)));
    },

    removeProduct(state, action) {
      state.quote.items = state.quote.items.filter(
        (item) => item.productId !== action.payload
      );
      showToast({ message: 'Product removed from cart !!', type: 'success' });
      db.cart.put(JSON.parse(JSON.stringify(state.quote)));
    },
    clearCart(state) {
      state.quote.items = [];
      state.quote.applied_coupons = null;
      state.quote.id = null;
      state.quote.discount = null;
      state.quote.grandDiscount = null;
      state.quote.grandDiscountType = null;

      db.cart.clear();
    },
    updateCart(state, action) {
      let itemIndex = state.quote.items.findIndex(
        (obj) => obj.productId === action.payload.item.productId
      );

      let currItem = state.quote.items[itemIndex];

      if (currItem) {
        let updatedQty = parseFloat(action.payload.quantity);
        if (
          updatedQty > currItem.max_allowed_qty ||
          updatedQty < currItem.min_allowed_qty
        ) {
          showToast({ message: 'Product Qty is not allowed', type: 'error' });
        } else {
          const newQty = parseInt(action.payload.quantity);
          if (newQty > currItem.qty) {
            incrementQty = currItem.is_qty_decimal
              ? currItem.qty + currItem.qty_increment
              : newQty;
          } else {
            incrementQty = currItem.is_qty_decimal
              ? currItem.qty - currItem.qty_increment
              : newQty;
          }
          currItem.qty = incrementQty;
          state.quote.items[itemIndex] = currItem;
        }
      }
      db.cart.put(JSON.parse(JSON.stringify(state.quote)));
    },
    updatePrice(state, action) {
      let itemIndex = state.quote.items.findIndex(
        (obj) => obj.productId === action.payload.item.productId
      );
      let currItem = state.quote.items[itemIndex];
      if (currItem) {
        currItem.subtotal = action.payload.subtotal;
        state.quote.items[itemIndex] = currItem;
      }
      db.cart.put(JSON.parse(JSON.stringify(state.quote)));
    },
    applyDiscount(state, action) {
      if (action.payload) {
        state.quote.grandDiscountType = action.payload.type;
        state.quote.discount = action.payload.discount;
        if (state.quote.grandDiscountType === '$') {
          state.quote.grandDiscount = action.payload.discount;
        } else {
          state.quote.grandDiscount = action.payload.discount;
        }
        db.cart.put(JSON.parse(JSON.stringify(state.quote)));
      }
    },
    applyItemDiscount(state, action) {
      const selectItem = action.payload.productId;
      let itemIndex = state.quote.items.findIndex(
        (obj) => obj.productId == selectItem
      );
      let currItem = state.quote.items[itemIndex];
      if (currItem) {
        currItem.discount = action.payload.discount;
        currItem.discount_type = action.payload.discount_type;
      }
      state.quote.items[itemIndex] = currItem;
      db.cart.put(JSON.parse(JSON.stringify(state.quote)));
    },

    applyCoupon(state, action) {
      if (action.payload) {
        state.quote.applied_coupons = action.payload;
        db.cart.put(JSON.parse(JSON.stringify(state.quote)));
      }
    },

    clearCoupon(state, action) {
      state.quote.applied_coupons = action.payload;
      db.cart.put(JSON.parse(JSON.stringify(state.quote)));
    },

    clearDiscount(state, action) {
      state.quote.grandDiscount = null;
      state.quote.grandDiscountType = null;
    },

    /**
     * Set Cart
     *
     * @param {*} state
     * @param {*} action
     */
    setCart(state, action) {
      let cartData = action.payload;
      if (cartData) {
        state.quote = cartData;
        state.quote.id = cartData.quoteId;
        state.quoteId = cartData.quoteId;
      }
    },
  },
});

export const cartActions = cartSlice.actions;

export default cartSlice.reducer;
