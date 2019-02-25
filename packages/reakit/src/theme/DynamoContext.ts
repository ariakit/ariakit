import * as React from "react";
import {
  unstable_VariableContextType,
  unstable_SetVariableContextType
} from "./VariableContext";

export type unstable_DynamoContextType = unstable_VariableContextType;
export type unstable_SetDynamoContextType = unstable_SetVariableContextType;

export const unstable_DynamoContext = React.createContext<
  unstable_DynamoContextType
>({});
export const unstable_SetDynamoContext = React.createContext<
  unstable_SetDynamoContextType
>(() => {});
