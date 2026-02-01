import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
// import storage from "redux-persist/lib/storage";
import storage from "./storage";
import { authAPISlice } from "./backendSlice/authAPISlice";
import { apiAPISlice } from "./backendSlice/apiAPISlice";
import authReducer from "./backendSlice/authReducer";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist auth state
};

const rootReducer = combineReducers({
  auth: authReducer,
  [authAPISlice.reducerPath]: authAPISlice.reducer,
  [apiAPISlice.reducerPath]: apiAPISlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const backendStore = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authAPISlice.middleware, apiAPISlice.middleware),
});

export const persistor = persistStore(backendStore);
