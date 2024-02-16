import { createSlice } from '@reduxjs/toolkit';

export const offlineModeSlice = createSlice({
  name: 'offline',
  initialState: {
    appOffline: false,
    offlineModeEnable: 0,
  },

  reducers: {
    setOfflineModeStatus(state, action) {
      state.appOffline = action?.payload;
    },
    setOfflineEnability(state, action) {
      state.offlineModeEnable = action?.payload;
    },
  },
});

export const offlineModeAction = offlineModeSlice.actions;

export default offlineModeSlice.reducer;
