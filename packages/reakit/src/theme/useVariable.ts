import * as React from "react";
import { unstable_VariableContext } from "./VariableContext";

export function unstable_useVariable(variable: string) {
  React.useDebugValue(variable);
  const variables = React.useContext(unstable_VariableContext);
  return variables[variable];
}
