import * as React from "react";

export type unstable_SystemContextType = {
  useCreateElement?: typeof React.createElement;
  [key: string]: any;
};

export const unstable_SystemContext = React.createContext<
  unstable_SystemContextType
>({});
