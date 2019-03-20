import * as React from "react";
import { useToken } from "./useToken";

export function useHook(
  hookName: string,
  options: Record<string, any> = {},
  htmlProps: React.HTMLAttributes<any> & React.RefAttributes<any> = {}
): React.HTMLAttributes<any> & React.RefAttributes<any> {
  React.useDebugValue(hookName);
  const useTokenHook = useToken(hookName);
  if (useTokenHook) {
    return useTokenHook(options, htmlProps);
  }
  return htmlProps;
}
