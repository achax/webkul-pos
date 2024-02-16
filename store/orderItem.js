import { createSlice } from '@reduxjs/toolkit';

const initialOrderItemState = {
  orderItemData: {
    address: null,
    cash_received: null,
    cash_returned: null,
    cashier_name: null,
    currency_code: null,
    coupon_code: null,
    customer: null,
    date: null,
    discount: null,
    grand_total: null,
    grandtotal_discount: null,
    increment_id: null,
    items: null,
    message: null,
    order_id: null,
    cashier_id: null,
    payment_info_data: null,
    pos_order_id: null,
    magento_order_id: null,
    payment_code: null,
    payment_label: null,
    state: null,
    status: null,
    synchronized: null,
    tax: null,
  },
};

export const orderItemSlice = createSlice({
  name: 'orderItem',
  initialState: initialOrderItemState,
  reducers: {
    setOrderItem(state, action) {
      state.orderItemData = action.payload;
    },
    clearOrderItem(state, action) {
      state.orderItemData = action.payload;
    },
  },
});

export const orderItemActions = orderItemSlice.actions;

export default orderItemSlice.reducer;
