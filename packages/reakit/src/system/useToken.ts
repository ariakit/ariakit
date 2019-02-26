import * as React from "react";
import { unstable_SystemContext } from "./SystemContext";

export function unstable_useToken<T>(token: string, defaultValue?: T): T {
  React.useDebugValue(token);
  const tokens = React.useContext(unstable_SystemContext);
  return tokens[token] != null ? tokens[token] : defaultValue;
}
