import * as React from "react";
import { AnyFunction } from "./types";

export function usePipe(...fns: Array<AnyFunction | null | undefined>) {
  return React.useCallback(arg => {
    const filteredFns = fns.filter(Boolean) as Array<AnyFunction>;
    return filteredFns.reduce((acc, curr) => curr(acc), arg);
  }, fns);
}
