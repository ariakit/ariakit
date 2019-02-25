import * as React from "react";
import { unstable_SetVariableContext } from "./VariableContext";

export function unstable_useSetVariable() {
  return React.useContext(unstable_SetVariableContext);
}
