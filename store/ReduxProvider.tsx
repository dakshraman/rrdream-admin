'use client';

import { Provider } from "react-redux";
import { backendStore } from "./backendStore";
import { ReactNode } from "react";

interface ReduxProviderProps {
  children: ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={backendStore}>{children}</Provider>;
}