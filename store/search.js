import { createSlice } from '@reduxjs/toolkit';

const initialCategoryState = {
  search: {
    id: null,
    name: null,
  },
};

export const searchSlice = createSlice({
  name: 'search',
  initialState: initialCategoryState,
  reducers: {
    filterByCategory(state, action) {
      state.search.id = action.payload;
    },
    filterByName(state, action) {
      state.search.name = action.payload;
    },
  },
});

export const searchActions = searchSlice.actions;

export default searchSlice.reducer;
