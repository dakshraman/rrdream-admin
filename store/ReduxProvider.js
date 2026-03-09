import { jsx as _jsx } from "react/jsx-runtime";
import { Provider } from "react-redux";
import { backendStore, persistor } from "./backendStore";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./queryClient";
export function ReduxProvider({ children }) {
    const queryClient = getQueryClient();
    return (_jsx(Provider, { store: backendStore, children: _jsx(PersistGate, { loading: null, persistor: persistor, children: _jsx(QueryClientProvider, { client: queryClient, children: children }) }) }));
}
