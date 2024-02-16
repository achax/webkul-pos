import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cart';
import configReducer from './config';
import cashierReducer from './cashier';
import searchReducer from './search';
import productReducer from './product';
import customerReducer from './customer';
import holdCartReducer from './holdCart';
import checkoutReducer from './checkout';
import orderReducer from './order';
import orderItemReducer from './orderItem';
import navReducer from './nav';
import cashDrawerReducer from './cashDrawer';
import operationsReducer from './operations';
import offlineReducer from './offlineMode';

export const store = configureStore({
  reducer: {
    storeConfig: configReducer,
    cart: cartReducer,
    cashier: cashierReducer,
    search: searchReducer,
    product: productReducer,
    customer: customerReducer,
    holdcart: holdCartReducer,
    checkout: checkoutReducer,
    order: orderReducer,
    orderItem: orderItemReducer,
    menu: navReducer,
    cashDrawer: cashDrawerReducer,
    operations: operationsReducer,
    offline: offlineReducer,
  },
});
