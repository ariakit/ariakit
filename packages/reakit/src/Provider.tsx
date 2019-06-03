import * as React from "react";
import { IdProvider, IdProviderProps } from "reakit-utils/useId";
import {
  unstable_SystemProviderProps,
  unstable_SystemProvider as SystemProvider
} from "./system/SystemProvider";

export type ProviderProps = IdProviderProps & unstable_SystemProviderProps;

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
