import * as React from "react";
import { HTMLAttributesWithRef } from "../_utils/types";

export type HookContextType = Record<
  string,
  <P extends HTMLAttributesWithRef = HTMLAttributesWithRef>(
    options: any,
    props?: P
  ) => P
>;

export const HookContext = React.createContext<HookContextType>({});

export default HookContext;
