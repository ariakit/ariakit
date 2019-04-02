import * as React from "react";
import { unstable_useToken } from "./useToken";

export function unstable_useOptions<T = {}>(
  name: string,
  options: T = {} as T,
  htmlProps: React.HTMLAttributes<any> & React.RefAttributes<any> = {}
): T {
  const hookName = `${name}Options`;
  React.useDebugValue(hookName);
  const useHook = unstable_useToken(hookName);
  if (useHook) {
    return { ...options, ...useHook(options, htmlProps) };
  }
  return options;
}
