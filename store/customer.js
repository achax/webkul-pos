import { createSlice } from '@reduxjs/toolkit';
import { db } from '~/models';

const initialCustomerState = {
  selectedCustomer: {
    entity_id: null,
    name: null,
    email: null,
    group_id: null,
    created_at: null,
    website_id: 1,
    confirmation: null,
    created_in: null,
    dob: null,
    gender: null,
    taxvat: null,
    lock_expires: null,
    phone_number: null,
    shipping_full: null,
    billing_full: null,
    billing_firstname: null,
    billing_lastname: null,
    billing_telephone: null,
    billing_postcode: null,
    billing_country_id: null,
    billing_region: null,
    billing_region_id: null,
    billing_street: null,
    billing_city: null,
    billing_fax: null,
    billing_vat_id: null,
    billing_company: null,
    status: false,
    __typename: 'CustomerItem',
  },

  isCustomerChanged: false,
  customerPop: {
    status: false,
    __typename: 'CustomerPop',
  },
};

export const customerSlice = createSlice({
  name: 'customer',
  initialState: initialCustomerState,
  reducers: {
    setCustomer(state, action) {
      let selectedCustomer = { ...action.payload, status: true };
      state.selectedCustomer = selectedCustomer;
    },

    addCustomer(state, action) {
      state.selectedCustomer = action.payload;
      const current = new Date();
      const dataTime = `${current.getDate()}-${
        current.getMonth() + 1
      }-${current.getFullYear()} ${current.getHours()}:${current.getMinutes()}:${current.getSeconds()}`;

      state.selectedCustomer.status = true;
      state.selectedCustomer.created_at = dataTime;

      try {
        db.customer
          .add(state.selectedCustomer)
          .then(() => {
            // showToast({ message: 'Customer Added !!', type: 'success' });
          })
          .catch((error) => console.log(error));
      } catch (e) {
        console.log(e);
      }
    },
    updateCustomer(state, action) {
      state.selectedCustomer.status = 'true';
      state.selectedCustomer.name = action.payload.name;
      state.selectedCustomer.phone_number = action.payload.phone_number;
      state.selectedCustomer.email = action.payload.email;
    },
    clearCustomer(state, action) {
      state.selectedCustomer = action.payload;
    },

    setCustomerSelectStatus(state, action) {
      state.customerPop.status = action.payload;
    },

    setCustomerChangedStatus(state, action) {
      state.isCustomerChanged = action?.payload;
    },
  },
});

export const customerActions = customerSlice.actions;

export default customerSlice.reducer;
