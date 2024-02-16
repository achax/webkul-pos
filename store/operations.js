import { createSlice } from '@reduxjs/toolkit';

const initialOperationsState = {
  operations: {
    couponStatus: false,
    confirmStatus: false,
    sideBarStatus: false,
  },
};

export const operationsSlice = createSlice({
  name: 'operations',
  initialState: initialOperationsState,
  reducers: {
    setCouponStatus(state, action) {
      state.operations.couponStatus = action.payload.status;
    },
    setConfirmStatus(state, action) {
      state.operations.confirmStatus = action.payload.status;
    },
    setSideBarStatus(state, action) {
      state.operations.sideBarStatus = action.payload.status;
    },
  },
});

export const operationsActions = operationsSlice.actions;

export default operationsSlice.reducer;
