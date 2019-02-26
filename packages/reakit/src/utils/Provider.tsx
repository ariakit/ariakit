import * as React from "react";
import {
  unstable_SystemProviderProps,
  unstable_SystemProvider as SystemProvider
} from "../system/SystemProvider";
import { unstable_IdProvider as IdProvider } from "./useId";

export type ProviderProps = unstable_SystemProviderProps;

export function Provider(props: ProviderProps) {
  return (
    <IdProvider>
      <SystemProvider {...props} />
    </IdProvider>
  );
}
