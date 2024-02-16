import { createSlice } from '@reduxjs/toolkit';

const initialCheckoutState = {
  checkoutData: {
    cashAmount: 0,
    cardAmount: 0,
    card: null,
  },
};

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: initialCheckoutState,
  reducers: {
    setCash(state, action) {
      state.checkoutData.cashAmount = action.payload;
    },
    setCard(state, action) {
      state.checkoutData.cardAmount = action.payload;
      state.checkoutData.card = action.payload.card;
    },
    updateCard(state, action) {
      state.checkoutData.card = action.payload;
    },
    clearPayment(state) {
      state.checkoutData.cashAmount = null;
      state.checkoutData.cardAmount = null;
    },
    remove(state, action) {
      const payload = action.payload;
      payload === 'cash'
        ? (state.checkoutData.cashAmount = null)
        : (state.checkoutData.cardAmount = null);
    },
  },
});

export const checkoutActions = checkoutSlice.actions;

export default checkoutSlice.reducer;
