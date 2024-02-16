import { createSlice } from '@reduxjs/toolkit';
import { db } from '~/models';
import { showToast } from '~/utils/Helper';

const initialOrderState = {
  orderData: {
    cart_items: null,
    message: '',
    billing_address: null,
    customer: null,
    cashier_name: null,
    pos_order_id: null,
    payment_code: null,
    payment_label: null,
    cash_received: null,
    base_cash_received: null,
    cash_returned: null,
    base_cash_returned: null,
    cashier_id: null,
    cashdrawer_id: null,
    synchronized: null,
    is_new_customer: null,
    currency_code: null,
    store_id: null,
    outlet_id: null,
    is_split_payment: null,
    increment_id: null,
  },
};

export const orderSlice = createSlice({
  name: 'order',
  initialState: initialOrderState,
  reducers: {
    setOrder(state, action) {
      state.orderData = action.payload;
      db.orderList
        .add(state.orderData)
        .then(() => {
          showToast({ message: 'Order Placed !!', type: 'success' });
        })
        .catch((error) => console.log(error));
    },
    syncOrder(state, action) {
      state.orderData.increment_id = action.payload.increment_id;
      try {
        db.transaction('rw', db.orderList, async () => {
          await db.orderList
            .where('synchronized')
            .equals(0)
            .modify({ synchronized: 1 });

          const updateData = await db.orderList
            .where({ synchronized: 1 })
            .toArray();
        }).catch((error) => {});
      } catch (err) {
        showToast({ type: 'error', message: err.message });
      }
    },
    clearOrder(state, action) {
      state.orderData = action.payload;
    },
    updateNote(state, action) {
      state.orderData.message = action.payload;
    },
  },
});

export const orderActions = orderSlice.actions;

export default orderSlice.reducer;
