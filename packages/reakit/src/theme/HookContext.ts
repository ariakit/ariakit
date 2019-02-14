import * as React from "react";

export type HookContextType = Record<
  string,
  (options: any, props?: any) => any
>;

export const HookContext = React.createContext<HookContextType>({});

export default HookContext;
