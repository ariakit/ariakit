import * as React from "react";
import { unstable_SystemContext } from "./SystemContext";

export function useToken<T = any>(token: string, defaultValue?: T): T {
  React.useDebugValue(token);
  const context = React.useContext(unstable_SystemContext);
  return context[token] != null ? context[token] : defaultValue;
}
