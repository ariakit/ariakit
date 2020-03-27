/**
 * Logs `messages` to the console using `console.warn` based on a `condition`.
 *
 * @example
 * import { warning } from "reakit-utils";
 *
 * warning(true, "a", "b"); // console.warn("a\nb")
 * warning(false, "a", "b"); // does nothing
 */
export function warning(condition: boolean, ...messages: string[]) {
  if (process.env.NODE_ENV !== "production") {
    if (!condition) return;

    const text = messages.join("\n");

    // eslint-disable-next-line no-console
    console.warn(text);

    // Throwing an error and catching it immediately to improve debugging
    // A consumer can use 'pause on caught exceptions'
    // https://github.com/facebook/react/issues/4216
    try {
      throw Error(text);
    } catch (x) {
      // do nothing
    }
  }
}
