import { Provider } from "react-redux";
import { backendStore, persistor } from "./backendStore";
import { ReactNode } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./queryClient";

interface ReduxProviderProps {
  children: ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  const queryClient = getQueryClient();

  return (
    <Provider store={backendStore}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
