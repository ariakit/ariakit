import * as React from "react";

import {
  unstable_SystemContextType,
  unstable_SystemContext
} from "./SystemContext";

export type unstable_SystemProviderProps = {
  system?: unstable_SystemContextType;
  children: React.ReactNode;
};

export function unstable_SystemProvider({
  system = {},
  children
}: unstable_SystemProviderProps) {
  return (
    <unstable_SystemContext.Provider value={system}>
      {children}
    </unstable_SystemContext.Provider>
  );
}
