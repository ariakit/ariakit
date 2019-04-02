import * as React from "react";
import { unstable_useToken } from "./useToken";

export function unstable_useProps(
  hookName: string,
  options: Record<string, any> = {},
  htmlProps: React.HTMLAttributes<any> & React.RefAttributes<any> = {}
): React.HTMLAttributes<any> & React.RefAttributes<any> {
  React.useDebugValue(hookName);
  const useTokenHook = unstable_useToken(hookName);
  if (useTokenHook) {
    return useTokenHook(options, htmlProps);
  }
  return htmlProps;
}
