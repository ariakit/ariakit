import * as React from "react";
import { SystemContextType, SystemContext } from "./SystemContext";

export type SystemProviderProps = {
  children: React.ReactNode;
  unstable_system: SystemContextType;
};

export function SystemProvider({
  children,
  unstable_system: system
}: SystemProviderProps) {
  return (
    <SystemContext.Provider value={system}>{children}</SystemContext.Provider>
  );
}
