import * as React from "react";

export type HookContextType = {
  useCreateElement?: typeof React.createElement;
} & {
  [key: string]: (
    options?: Record<string, any>,
    props?: React.HTMLAttributes<any> & React.RefAttributes<any>
  ) => React.HTMLAttributes<any> & React.RefAttributes<any>;
};

export const HookContext = React.createContext<HookContextType>({});
