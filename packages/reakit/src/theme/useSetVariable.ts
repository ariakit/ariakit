import * as React from "react";
import { SetVariableContext } from "./VariableContext";

export function useSetVariable() {
  return React.useContext(SetVariableContext);
}
