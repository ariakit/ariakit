import * as React from "react";

export type unstable_ConstantContextType = Record<string, any>;

export const unstable_ConstantContext = React.createContext<
  unstable_ConstantContextType
>({});
