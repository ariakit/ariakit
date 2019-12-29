import * as React from "react";
import { AnyFunction } from "./types";

/**
 * React custom hook that combines multiple callbacks into one.
 *
 * @example
 * import React from "react";
 * import { useAllCallbacks } from "reakit-utils";
 *
 * function Component(props) {
 *   const onClick = () => {};
 *   return (
 *     <button onClick={useAllCallbacks(onClick, props.onClick)}>Button</button>
 *   );
 * }
 */
export function useAllCallbacks(
  ...callbacks: Array<AnyFunction | null | undefined>
): AnyFunction {
  return React.useCallback((...args: any[]) => {
    const fns = callbacks.filter(Boolean) as Array<AnyFunction>;
    for (const callback of fns) callback(...args);
  }, callbacks);
}
