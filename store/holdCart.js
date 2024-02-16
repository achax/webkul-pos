import { createSlice } from '@reduxjs/toolkit';
import { db } from '~/models';
import { showToast } from '~/utils/Helper';

const initialHoldCartState = {
  holdCartData: {
    id: null,
    date: null,
    items: null,
    note: null,
    currency_code: null,
    grand_total: null,
    base_grand_total: null,
    cashier_id: null,
    outlet_id: null,
    synchronized: 0,
  },
};

export const holdCartSlice = createSlice({
  name: 'holdcart',
  initialState: initialHoldCartState,
  reducers: {
    setHoldCart(state, action) {
      state.holdCartData = action.payload;
      db.holdCart
        .add(state.holdCartData)
        .then(() => {
          showToast({ message: 'Cart Hold !!', type: 'success' });
        })
        .catch((error) => console.log(error));
    },

    refreshHoldCart(state, action) {
      state.holdCartData = action.payload;
      state.holdCartData = state.holdCartData.filter(
        (item) => item.id !== action.payload.id
      );
    },
    syncHoldCart(state, action) {
      db.transaction('rw', db.holdCart, async () => {
        await db.holdCart
          .where('synchronized')
          .equals(0)
          .modify({ synchronized: 1 });

        const updateData = await db.holdCart
          .where({ synchronized: 1 })
          .toArray();
      }).catch((error) => {
        console.error('Generic error: ' + error);
      });
    },
    removeHoldItem(state, action) {
      state.holdCartData = state.holdCartData.filter(
        (item) => item.id !== action.payload
      );

      db.transaction('rw', db.holdCart, async () => {
        await db.holdCart
          .where('id')
          .equals(action?.payload)
          .modify({ isDeleted: 1 });
      }).catch((error) => {
        console.error('IndexedDB error: ' + error);
      });
    },
  },
});

export const holdCartActions = holdCartSlice.actions;

export default holdCartSlice.reducer;
