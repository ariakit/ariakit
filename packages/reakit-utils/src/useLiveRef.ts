import * as React from "react";

/**
 * A `React.Ref` that keeps track of the passed `value`.
 */
export function useLiveRef<T>(value: T): React.MutableRefObject<T> {
  const ref = React.useRef(value);

  React.useEffect(() => {
    ref.current = value;
  });

  return ref;
}
