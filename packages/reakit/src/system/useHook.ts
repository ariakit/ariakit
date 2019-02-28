import * as React from "react";
import { unstable_useToken } from "./useToken";

export function unstable_useHook(
  hookName: string,
  options: Record<string, any> = {},
  htmlProps: React.HTMLAttributes<any> & React.RefAttributes<any> = {}
): React.HTMLAttributes<any> & React.RefAttributes<any> {
  React.useDebugValue(hookName);
  const useHook = unstable_useToken(hookName);
  if (useHook) {
    return useHook(options, htmlProps);
  }
  return htmlProps;
}
