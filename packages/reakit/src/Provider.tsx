import * as React from "react";
import { IdProvider, IdProviderProps } from "reakit-utils/useId";
import {
  SystemProviderProps,
  SystemProvider
} from "reakit-system/SystemProvider";

export type ProviderProps = IdProviderProps & Partial<SystemProviderProps>;

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
