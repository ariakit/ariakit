import * as React from "react";

export type HookContextType = {
  useCreateElement: typeof React.createElement;
  [key: string]: (options: any, props?: any) => any;
};

export const HookContext = React.createContext<HookContextType>({
  useCreateElement: React.createElement
});

export default HookContext;
