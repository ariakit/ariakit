import * as React from "react";
import {
  unstable_SystemProviderProps,
  unstable_SystemProvider as SystemProvider
} from "../system/SystemProvider";
import {
  unstable_IdProvider as IdProvider,
  unstable_IdProviderProps
} from "./useId";

export type ProviderProps = unstable_IdProviderProps &
  unstable_SystemProviderProps;

export function Provider({
  unstable_prefix: prefix,
  unstable_system: system = {},
  children
}: ProviderProps) {
  return (
    <IdProvider unstable_prefix={prefix}>
      <SystemProvider unstable_system={system}>{children}</SystemProvider>
    </IdProvider>
  );
}
