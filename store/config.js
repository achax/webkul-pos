import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '~utils/Constants';
import {
  setLocalStorage,
  STORE_CONFIG,
  removeFromLocalStorage,
} from './local-storage';

/**
 * Initializing the state
 */
const initialConfigState = {
  config: {
    synced: false,
    enableoffline: 0,
    barcode_attribute: 'sku',
    logo: '/',
    pagesize: DEFAULT_PAGE_SIZE,
    application_name: 'Point of Sales',
    application_short_name: 'POS',
    bg_color: '#000',
    theme_color: '#fff',
    cash_title: 'Cash',
    credit_title: 'Credit',
    possplit_title: 'Split Payment',
  },
};

export const configSlice = createSlice({
  name: 'storeConfig',
  initialState: initialConfigState,
  reducers: {
    setConfig(state, action) {
      setLocalStorage(STORE_CONFIG, action.payload);
      state.config = { ...action.payload, synced: true };
    },
    reset(state) {
      removeFromLocalStorage(STORE_CONFIG);
      state.config = undefined;
    },
  },
});

export const configActions = configSlice.actions;

export default configSlice.reducer;
