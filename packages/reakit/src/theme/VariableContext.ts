import * as React from "react";

export type VariableContextType = Record<string, any>;

export type SetVariableContextType = (
  updaterOrState:
    | VariableContextType
    | ((state: VariableContextType) => VariableContextType)
) => void;

export const VariableContext = React.createContext<VariableContextType>({});
export const SetVariableContext = React.createContext<SetVariableContextType>(
  () => {}
);

export default VariableContext;
