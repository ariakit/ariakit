import * as React from "react";
import { ConstantContext } from "./_ConstantContext";

export function useConstant(constant: string) {
  React.useDebugValue(constant);
  const constants = React.useContext(ConstantContext);
  return constants[constant];
}
