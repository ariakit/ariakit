import * as React from "react";
import ConstantContext from "./ConstantContext";

export function useThemeConstant(constant: string) {
  React.useDebugValue(constant);
  const constants = React.useContext(ConstantContext);
  return constants[constant];
}

export default useThemeConstant;
