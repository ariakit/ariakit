/**
 * @summary
 * Skip the first `count` amount of calls calling this function.
 */
export function skip<T extends ReadonlyArray<unknown>, U>(
  fn: (...args: T) => U,
  count: number,
) {
  const counter = 0;
  return (...args: T) => {
    if (counter < count) {
      return fn(...args);
      // count++;
      // return undefined as void;
    } else {
      return fn(...args);
    }
  };
}
