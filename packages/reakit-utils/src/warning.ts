import * as React from "react";

/**
 * Logs `messages` to the console using `console.warn` based on a `condition`.
 *
 * @example
 * import { warning } from "reakit-utils";
 *
 * warning(true, "a", "b"); // console.warn("a\nb")
 * warning(false, "a", "b"); // does nothing
 */
export function warning(condition: boolean, ...messages: unknown[]) {
  if (process.env.NODE_ENV !== "production") {
    const warn = () => {
      if (!condition) return;

      // eslint-disable-next-line no-console
      console.warn(
        ...messages.map((message, i) =>
          i > 0 && typeof message === "string" ? `\n${message}` : message
        )
      );

      // Throwing an error and catching it immediately to improve debugging
      // A consumer can use 'pause on caught exceptions'
      // https://github.com/facebook/react/issues/4216
      try {
        throw Error(messages.join(" "));
      } catch (e) {
        // do nothing
      }
    };

    try {
      React.useEffect(() => {
        warn();
      }, [condition]);
    } catch (e) {
      warn();
    }
  }
}
