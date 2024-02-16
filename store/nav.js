import { createSlice } from '@reduxjs/toolkit';

const initialNavState = {
  menu: {
    status: false,
  },
};

export const navSlice = createSlice({
  name: 'menu',
  initialState: initialNavState,
  reducers: {
    UpdateStatus(state, action) {
      state.menu.status = !action.payload.isSideBar;
    },
  },
});

export const menuActions = navSlice.actions;

export default navSlice.reducer;
