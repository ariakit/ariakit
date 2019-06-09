import * as React from "react";
import { useToken } from "./useToken";

export function useOptions<T = {}>(
  name: string,
  options: T = {} as T,
  htmlProps: React.HTMLAttributes<any> & React.RefAttributes<any> = {}
): T {
  const hookName = `use${name}Options`;
  React.useDebugValue(hookName);
  const useHook = useToken(hookName);
  if (useHook) {
    return { ...options, ...useHook(options, htmlProps) };
  }
  return options;
}
