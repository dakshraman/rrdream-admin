'use client';

import { Provider } from "react-redux";
import { backendStore, persistor } from "./backendStore";
import { ReactNode } from "react";
import { PersistGate } from "redux-persist/integration/react";

interface ReduxProviderProps {
  children: ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={backendStore}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}