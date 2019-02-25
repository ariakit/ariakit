import * as React from "react";

export type unstable_HookContextType = {
  useCreateElement?: typeof React.createElement;
} & {
  [key: string]: (
    options?: Record<string, any>,
    props?: React.HTMLAttributes<any> & React.RefAttributes<any>
  ) => React.HTMLAttributes<any> & React.RefAttributes<any>;
};

export const unstable_HookContext = React.createContext<
  unstable_HookContextType
>({});
