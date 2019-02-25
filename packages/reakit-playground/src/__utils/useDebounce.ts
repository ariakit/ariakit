import * as React from "react";

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  ms: number,
  inputs: any[]
) {
  const timeoutHandler = React.useRef<NodeJS.Timeout | null>(null);
  const debouncedFunction = React.useCallback(callback, inputs);

  React.useEffect(
    () => () => {
      if (timeoutHandler.current != null) {
        clearTimeout(timeoutHandler.current);
      }
    },
    [timeoutHandler]
  );

  return (...args: Parameters<T>) => {
    if (timeoutHandler.current) {
      clearTimeout(timeoutHandler.current);
    }
    timeoutHandler.current = setTimeout(() => {
      debouncedFunction(...args);
    }, ms);
  };
}
