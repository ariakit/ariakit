import * as React from "react";
import { AnyFunction } from "./types";

/**
 * A React custom hook similar to [`useAllCallbacks`](#useallcallbacks), but
 * it'll pass the returned value from a function to the next function.
 */
export function usePipe(...fns: Array<AnyFunction | null | undefined>) {
  return React.useCallback(arg => {
    const filteredFns = fns.filter(Boolean) as Array<AnyFunction>;
    return filteredFns.reduce((acc, curr) => curr(acc), arg);
  }, fns);
}
