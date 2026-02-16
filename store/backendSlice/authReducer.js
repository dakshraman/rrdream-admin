import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
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
      state.user = action.payload.user || action.payload.admin; // specific user field
      state.admin = action.payload.admin; // keep for backward compatibility
      state.token = action.payload.token;
      state.isLoggedIn = true;
    },
    logout(state) {
      state.user = null;
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
