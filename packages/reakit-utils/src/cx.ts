/**
 * Returns a string with truthy class names separated by space.
 *
 * @example
 * import { cx } from "reakit-utils";
 *
 * const className = cx("a", "b", false, true && "c");
 */
export function cx(
  ...classes: Array<string | undefined | null | false>
): string | undefined {
  return classes.filter(Boolean).join(" ") || undefined;
}
