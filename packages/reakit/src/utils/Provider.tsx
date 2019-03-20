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

export function Provider({ prefix, system, children }: ProviderProps) {
  return (
    <IdProvider prefix={prefix}>
      <SystemProvider system={system}>{children}</SystemProvider>
    </IdProvider>
  );
}
