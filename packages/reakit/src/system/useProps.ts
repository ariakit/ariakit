import * as React from "react";
import { unstable_useToken } from "./useToken";

export function unstable_useProps(
  name: string,
  options: Record<string, any> = {},
  htmlProps: React.HTMLAttributes<any> & React.RefAttributes<any> = {}
): React.HTMLAttributes<any> & React.RefAttributes<any> {
  const hookName = `${name}Props`;
  React.useDebugValue(hookName);
  const useHook = unstable_useToken(hookName);
  if (useHook) {
    return useHook(options, htmlProps);
  }
  return htmlProps;
}
