import * as React from "react";
import {
  unstable_SystemContextType,
  unstable_SystemContext
} from "./SystemContext";
import { unstable_mergeSystem } from "./mergeSystem";

export type unstable_SystemProviderProps = {
  children: React.ReactNode;
};

let system: unstable_SystemContextType = {};

export function unstable_SystemProvider({
  children
}: unstable_SystemProviderProps) {
  return (
    <unstable_SystemContext.Provider value={system}>
      {children}
    </unstable_SystemContext.Provider>
  );
}

unstable_SystemProvider.unstable_use = (
  ...systems: unstable_SystemContextType[]
) => {
  if (systems.length === 1) {
    [system] = systems;
  } else if (systems.length) {
    system = unstable_mergeSystem(...systems);
  }
};
