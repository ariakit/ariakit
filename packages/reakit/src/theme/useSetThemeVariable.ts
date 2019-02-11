import * as React from "react";
import { SetVariableContext } from "./VariableContext";

export function useSetThemeVariable() {
  return React.useContext(SetVariableContext);
}

export default useSetThemeVariable;
