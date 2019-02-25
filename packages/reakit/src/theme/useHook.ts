import * as React from "react";
import { unstable_HookContext } from "./HookContext";

export function unstable_useHook(
  hook: string,
  options: Record<string, any> = {},
  props: React.HTMLAttributes<any> & React.RefAttributes<any> = {}
) {
  React.useDebugValue(hook);
  const hooks = React.useContext(unstable_HookContext);
  if (hook in hooks) {
    return hooks[hook](options, props);
  }
  return props;
}
