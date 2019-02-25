import * as React from "react";

export type unstable_VariableContextType = Record<string, any>;

export type unstable_SetVariableContextType = (
  updaterOrState:
    | unstable_VariableContextType
    | ((state: unstable_VariableContextType) => unstable_VariableContextType)
) => void;

export const unstable_VariableContext = React.createContext<
  unstable_VariableContextType
>({});
export const unstable_SetVariableContext = React.createContext<
  unstable_SetVariableContextType
>(() => {});
