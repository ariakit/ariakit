import * as React from "react";
import {
  VariableContextType,
  SetVariableContextType
} from "./_VariableContext";

export type DynamoContextType = VariableContextType;
export type SetDynamoContextType = SetVariableContextType;

export const DynamoContext = React.createContext<DynamoContextType>({});
export const SetDynamoContext = React.createContext<SetDynamoContextType>(
  () => {}
);
