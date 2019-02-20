import * as React from "react";
import VariableContext from "./VariableContext";

export function useVariable(variable: string) {
  React.useDebugValue(variable);
  const variables = React.useContext(VariableContext);
  return variables[variable];
}

export default useVariable;
