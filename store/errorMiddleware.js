import { isRejectedWithValue } from '@reduxjs/toolkit';
import { logout } from './backendSlice/authReducer';
import toast from 'react-hot-toast';

export const errorMiddleware = (api) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    if (action.payload?.status === 401 || action.payload?.status === 422) {
      api.dispatch(logout());
      toast.error('Session expired or invalid. Please login again.');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
  return next(action);
};
