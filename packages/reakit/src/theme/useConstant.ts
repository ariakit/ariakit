import * as React from "react";
import { ConstantContext } from "./ConstantContext";

export function useConstant(constant: string) {
  React.useDebugValue(constant);
  const constants = React.useContext(ConstantContext);
  return constants[constant];
}
