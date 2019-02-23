import * as React from "react";
import { ThemeProviderProps, ThemeProvider } from "../theme/ThemeProvider";
import { IdProvider } from "./useId";

export type ProviderProps = ThemeProviderProps;

export function Provider(props: ProviderProps) {
  return (
    <IdProvider>
      <ThemeProvider {...props} />
    </IdProvider>
  );
}
