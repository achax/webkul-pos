import { createSlice } from '@reduxjs/toolkit';
const initialCashDrawerState = {
  cashdrawer: {
    status: false,
  },
};
export const cashDrawerSlice = createSlice({
  name: 'cashdrawer',
  initialState: initialCashDrawerState,
  reducers: {
    setStatus(state, action) {
      state.cashdrawer.status = action.payload.status;
    },
  },
});
export const cashDrawerActions = cashDrawerSlice.actions;
export default cashDrawerSlice.reducer;
