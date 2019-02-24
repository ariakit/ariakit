import * as React from "react";
import { SetVariableContext } from "./_VariableContext";

export function useSetVariable() {
  return React.useContext(SetVariableContext);
}
