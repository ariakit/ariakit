import type { MutableRefObject, RefCallback } from "react";

/**
 * Sets both a function and object React ref.
 */
export function setRef<T>(
  ref: RefCallback<T> | MutableRefObject<T> | null | undefined,
  value: T
) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}
