import * as React from "react";
import {
  unstable_SystemContextType,
  unstable_SystemContext
} from "./SystemContext";

export type unstable_SystemProviderProps = {
  children: React.ReactNode;
  unstable_system: unstable_SystemContextType;
};

export function unstable_SystemProvider({
  children,
  unstable_system: system
}: unstable_SystemProviderProps) {
  return (
    <unstable_SystemContext.Provider value={system}>
      {children}
    </unstable_SystemContext.Provider>
  );
}
