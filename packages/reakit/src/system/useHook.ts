import * as React from "react";
import { unstable_SystemContext } from "./SystemContext";

export function unstable_useHook(
  hook: string,
  options: Record<string, any> = {},
  htmlProps: React.HTMLAttributes<any> & React.RefAttributes<any> = {}
): React.HTMLAttributes<any> & React.RefAttributes<any> {
  React.useDebugValue(hook);
  const hooks = React.useContext(unstable_SystemContext);
  if (hook in hooks) {
    return hooks[hook](options, htmlProps);
  }
  return htmlProps;
}
