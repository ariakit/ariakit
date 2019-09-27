import * as React from "react";
import { useToken } from "./useToken";

export function useProps(
  name: string,
  options: Record<string, any> = {},
  htmlProps: React.HTMLAttributes<any> & React.RefAttributes<any> = {}
): React.HTMLAttributes<any> & React.RefAttributes<any> {
  const hookName = `use${name}Props`;
  React.useDebugValue(hookName);
  const useHook = useToken(hookName);
  if (useHook) {
    return useHook(options, htmlProps);
  }
  return htmlProps;
}
