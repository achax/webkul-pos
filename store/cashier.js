import { createSlice } from '@reduxjs/toolkit';
import { db } from '~/models';
import { showToast } from '~/utils/Helper';

const initialCashierState = {
  cashier: {
    id: null,
    outlet_id: null,
    firstname: null,
    lastname: null,
    email: null,
    contactno: null,
    userImage: null,
    initialAmountSetup: null,
    note: null,
  },
};

export const cashierSlice = createSlice({
  name: 'cashier',
  initialState: initialCashierState,
  reducers: {
    loggedIn(state, action) {
      state.cashier = action.payload;
      state.cashier.initialAmountSetup = null;
    },
    loggedOut(state) {
      state.cashier = undefined;
    },
    initialAmount(state, action) {
      state.cashier.initialAmountSetup = action.payload;
      db.cashDrawer
        .put(action.payload)
        .then(() => {
          showToast({
            message: 'Initial Amount Setup !!',
            type: 'success',
          });
        })
        .catch((error) => console.log(error));
    },
  },
});

export const cashierActions = cashierSlice.actions;

export default cashierSlice.reducer;
