import * as React from "react";
import { warning } from "./warning";

/**
 * Logs `messages` to the console using `console.warn` based on a `condition`.
 * This should be used inside components.
 */
export function useWarning(condition: boolean, ...messages: any[]) {
  if (process.env.NODE_ENV !== "production") {
    React.useEffect(() => {
      warning(condition, ...messages);
    }, [condition]);
  }
}
