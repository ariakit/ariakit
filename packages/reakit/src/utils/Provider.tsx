import * as React from "react";
import {
  unstable_ThemeProviderProps,
  unstable_ThemeProvider as ThemeProvider
} from "../theme/ThemeProvider";
import { unstable_IdProvider as IdProvider } from "./useId";

export type ProviderProps = unstable_ThemeProviderProps;

export function Provider(props: ProviderProps) {
  return (
    <IdProvider>
      <ThemeProvider {...props} />
    </IdProvider>
  );
}
