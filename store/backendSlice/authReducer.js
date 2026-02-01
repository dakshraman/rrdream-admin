import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  admin: null,
  token: null,
  isLoggedIn: false,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.admin = action.payload.admin;
      state.token = action.payload.token;
      state.isLoggedIn = true;
    },
    logout(state) {
      state.admin = null;
      state.token = null;
      state.isLoggedIn = false;
      state.loading = false;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { login, logout, setLoading } = authSlice.actions;

export default authSlice.reducer;
