import { createSlice } from '@reduxjs/toolkit';

/**
 * Initializing the state
 */
const initialProductState = {
  productList: [],
  synced: false,
  price: null,
};

export const productsSlice = createSlice({
  name: 'product',
  initialState: initialProductState,
  reducers: {
    loadProduct(state, action) {
      state.productList = action.payload;
      state.synced = true;
    },
    setPrice(state, action) {
      state.price = action.payload;
    },
  },
});

export const productsActions = productsSlice.actions;

export default productsSlice.reducer;
