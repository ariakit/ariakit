import * as React from "react";
import { AnyFunction } from "./types";

export function useAllCallbacks(
  ...callbacks: Array<AnyFunction | null | undefined>
) {
  return React.useCallback((...args: any[]) => {
    const fns = callbacks.filter(Boolean) as Array<AnyFunction>;
    for (const callback of fns) callback(...args);
  }, callbacks);
}
