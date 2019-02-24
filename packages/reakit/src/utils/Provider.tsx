import * as React from "react";
import { ThemeProviderProps, ThemeProvider } from "../theme/_ThemeProvider";
import { IdProvider } from "./_useId";

export type ProviderProps = ThemeProviderProps;

export function Provider(props: ProviderProps) {
  return (
    <IdProvider>
      <ThemeProvider {...props} />
    </IdProvider>
  );
}
