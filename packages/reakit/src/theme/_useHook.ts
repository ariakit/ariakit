import * as React from "react";
import { HookContext } from "./_HookContext";

export function useHook(
  hook: string,
  options: Record<string, any> = {},
  props: React.HTMLAttributes<any> & React.RefAttributes<any> = {}
) {
  React.useDebugValue(hook);
  const hooks = React.useContext(HookContext);
  if (hook in hooks) {
    return hooks[hook](options, props);
  }
  return props;
}
