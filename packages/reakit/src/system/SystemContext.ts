import * as React from "react";
import { unstable_useCreateElement } from "../utils/useCreateElement";

export type unstable_SystemContextType = {
  useCreateElement?: typeof unstable_useCreateElement;
  [key: string]: any;
};

export const unstable_SystemContext = React.createContext<
  unstable_SystemContextType
>({});
