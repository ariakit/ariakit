import * as React from "react";
import { unstable_ConstantContext } from "./ConstantContext";

export function unstable_useConstant(constant: string) {
  React.useDebugValue(constant);
  const constants = React.useContext(unstable_ConstantContext);
  return constants[constant];
}
