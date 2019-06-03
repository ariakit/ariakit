import * as React from "react";
import { useCreateElement } from "reakit-utils/useCreateElement";

export type unstable_SystemContextType = {
  useCreateElement?: typeof useCreateElement;
  [key: string]: any;
};

export const unstable_SystemContext = React.createContext<
  unstable_SystemContextType
>({});
